import React from 'react';
import StatsGrid from '../../../components/StatsGrid';

// `stats` can be supplied directly from a role-specific API response.
export default function DashboardStats({ stats, overview, useOverview = false }) {
  return <StatsGrid stats={stats} overview={overview} isAdmin={useOverview} />;
}
