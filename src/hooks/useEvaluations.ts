import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';

export function useEvaluations(cycle?: string, status?: string) {
  return useQuery({
    queryKey: ['evaluations', { cycle, status }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (cycle) params.set('cycle', cycle);
      if (status) params.set('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      return api.get<any[]>(`/evaluations${query}`);
    }
  });
}

export function useEvaluationDetails(id: string | null) {
  return useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => api.get<any>(`/evaluations/${id}`),
    enabled: Boolean(id)
  });
}

export function useUpdateScoresMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version, scores }: { id: string; version: number; scores: any[] }) => {
      return api.put<any>(`/evaluations/${id}/scores`, { version, scores });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['evaluation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useGenerateCoachingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<any>(`/evaluations/${id}/coaching`),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
    }
  });
}
