 "use client";

 import { useCallback, useMemo, useState } from "react";

 export interface InferredServerPaginationOptions {
   initialPage?: number;
   pageSize: number;
 }

 /**
  * Minimal server-pagination helper when the backend doesn't return total counts.
  * We infer "has next page" based on whether the current page returns `pageSize` items.
  */
 export function useInferredServerPagination({
   initialPage = 1,
   pageSize,
 }: InferredServerPaginationOptions) {
   const [page, setPage] = useState(initialPage);
   const [maxKnownPage, setMaxKnownPage] = useState(initialPage);
   const [lastPageSize, setLastPageSize] = useState<number>(0);

  const reset = useCallback(
    (nextPage: number = initialPage) => {
      setPage(nextPage);
      setMaxKnownPage(nextPage);
      setLastPageSize(0);
    },
    [initialPage]
  );

   const observePageResult = useCallback(
     (itemsLength: number) => {
       setLastPageSize(itemsLength);
       setMaxKnownPage((prev) => {
         // If the page is "full", we assume there might be another page after it.
         const impliedMax = itemsLength >= pageSize ? page + 1 : page;
         return Math.max(prev, impliedMax);
       });
     },
     [page, pageSize]
   );

   const totalPages = maxKnownPage;
   const totalItems = useMemo(() => {
     // Lower-bound estimate (enough to render a stable "showing X-Y of Z" label).
     return (page - 1) * pageSize + lastPageSize;
   }, [page, pageSize, lastPageSize]);

   return {
     page,
     setPage,
     totalPages,
     totalItems,
     observePageResult,
    reset,
   };
 }

