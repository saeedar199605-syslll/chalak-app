import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';

export function useEmployees(search?: string) {
  return useQuery({
    queryKey: ['employees', { search }],
    queryFn: () => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return api.get<any[]>(`/employees${q}`);
    }
  });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/employees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}
