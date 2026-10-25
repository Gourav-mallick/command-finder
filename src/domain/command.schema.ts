import { z } from 'zod';
export const CommandSchema = z.object({
  id: z.string().min(1).max(120), name: z.string().min(1).max(120),
  command: z.string().min(1).max(1000).refine(value => !/[\r\n\0]/.test(value), 'Command must fit on one terminal input line'), description: z.string().min(1).max(1000),
  category: z.string().min(1).max(80), tags: z.array(z.string().min(1).max(80)).max(30),
  examples: z.array(z.string().min(1).max(1000)).max(20),
  platforms: z.array(z.enum(['linux', 'windows', 'macos', 'all'])).min(1).max(4),
  risk: z.enum(['low', 'medium', 'high']), source: z.enum(['builtin', 'local']).optional()
});
export const CommandFileSchema = z.object({ commands: z.array(CommandSchema).max(2000) }).superRefine((file, context) => {
  const seen = new Set<string>();
  file.commands.forEach((command, index) => {
    if (seen.has(command.id)) context.addIssue({ code: 'custom', path: ['commands', index, 'id'], message: `Duplicate command id: ${command.id}` });
    seen.add(command.id);
  });
});
