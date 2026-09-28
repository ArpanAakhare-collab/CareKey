import React from 'react';
import { PatientDashboard } from './PatientDashboard';

export function MyDoctors({ onNavigate }) {
  return <PatientDashboard onNavigate={onNavigate} initialTab="my-doctors" />;
}
