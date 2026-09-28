import React from 'react';
import { PatientDashboard } from './PatientDashboard';

export function FindDoctor({ onNavigate }) {
  return <PatientDashboard onNavigate={onNavigate} initialTab="find-doctor" />;
}
