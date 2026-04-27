import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        topic: z.string(),
        date: z.any(),
        readTime: z.any(),
        author: z.any(),
        excerpt: z.any(),
        heroImage: z.string(),
        tags: z.array(z.string()).optional(),
        featured: z.boolean().optional()
    })
});

export const collections = {
    'posts': posts
};
