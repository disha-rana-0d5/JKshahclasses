/**
 * Generates a URL-friendly slug from a given string.
 * @param text The string to convert.
 * @returns The converted slug.
 */
export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')     // Remove non-word chars (except spaces and hyphens)
        .replace(/[\s_-]+/g, '-')      // Replace spaces, underscores and multiple hyphens with a single hyphen
        .replace(/-+/g, '-')           // Collapse multiple hyphens again specifically
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
};
