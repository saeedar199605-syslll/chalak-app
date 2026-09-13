import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';

export function useJobProfiles() {
  return useQuery({
    queryKey: ['jobProfiles'],
    queryFn: () => api.get<any[]>('/job-profiles')
  });
}

export function useCreateJobProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/job-profiles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProfiles'] });
    }
  });
}
