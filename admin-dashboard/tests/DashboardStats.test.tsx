import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '../src/components/features/dashboard/StatsCards';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Mock the API client
jest.mock('../src/lib/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({
      data: {
        users: 100,
        creators: 20,
        podcasts: 5,
        episodes: 45
      }
    })
  }
}));

describe('StatsCards Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('should render all stat cards and display mocked data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StatsCards />
      </QueryClientProvider>
    );
    
    // Test titles wait for finding one, meaning it's rendered
    expect(await screen.findByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Creators')).toBeInTheDocument();
    expect(screen.getByText('Total Podcasts')).toBeInTheDocument();
    expect(screen.getByText('Total Episodes')).toBeInTheDocument();
    
    // Test values based on the mock
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });
});
