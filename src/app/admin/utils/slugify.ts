/**
 * Generates a URL-friendly slug from a given string.
 * @param text The string to convert.
 * @returns The converted slug.
 */
export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
        .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
};
