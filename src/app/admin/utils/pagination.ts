export type PaginationItemType = number | "ellipsis";

/**
 * Generates an array of page numbers and "ellipsis" strings for pagination.
 * e.g., [1, 2, 3, 4, 5, "ellipsis", 10] if currentPage is 1 and totalPages is 10.
 */
export const getPaginationItems = (
    currentPage: number,
    totalPages: number,
    siblingCount = 1
): PaginationItemType[] => {
    // The number of page numbers we want to show without dots
    // siblingCount + firstPage + lastPage + currentPage + 2*dots
    const totalPageNumbers = 5 + siblingCount;

    // Case 1: If total pages is less than the count we want to show, show all
    if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Indices for sibling pages
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Should we show dots?
    // We only show dots if there is more than one item between the sibling and the boundary (1 or totalPages)
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but right dots should be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, "ellipsis", totalPages];
    }

    // Case 3: No right dots to show, but left dots should be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = Array.from(
            { length: rightItemCount },
            (_, i) => totalPages - rightItemCount + i + 1
        );
        return [firstPageIndex, "ellipsis", ...rightRange];
    }

    // Case 4: Both left and right dots to show
    if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from(
            { length: rightSiblingIndex - leftSiblingIndex + 1 },
            (_, i) => leftSiblingIndex + i
        );
        return [firstPageIndex, "ellipsis", ...middleRange, "ellipsis", lastPageIndex];
    }

    return [];
};
