import { useQuery } from '@tanstack/react-query';

export function useItemDetail(category: string | null, id: string | null) {
  return useQuery({

    // 當 category 或 id 改變時，React Query 會自動重新抓取
    queryKey: ['itemDetail', category, id],
    queryFn: async () => {
      if (!category || !id) return null;
      const res = await fetch(`/data/${category.toLowerCase()}/${id}.json`);
      if (!res.ok) {
        throw new Error('Data not found');
      }
      return res.json();
    },

    // category 和 id 都有值時才發起請求
    enabled: !!category && !!id
  });
}
