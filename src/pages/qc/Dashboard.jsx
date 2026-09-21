import React from 'react';
import { roleDashboards } from '../../data/roleDashboards';
import RoleDashboardContent from '../shared/RoleDashboardContent';
export default function Dashboard(props) { return <RoleDashboardContent config={roleDashboards['qc-test']} {...props} />; }
