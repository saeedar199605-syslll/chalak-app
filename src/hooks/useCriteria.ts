import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';

export function useCriteria(category?: string) {
  return useQuery({
    queryKey: ['criteria', { category }],
    queryFn: () => {
      const q = category ? `?category=${category}` : '';
      return api.get<any[]>(`/criteria${q}`);
    }
  });
}

export function useCreateCriterionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/criteria', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criteria'] });
    }
  });
}
