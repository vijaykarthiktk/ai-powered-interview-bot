import React from 'react';
import { Briefcase } from 'lucide-react';
import { interviewRoles } from '../data/roles';
import type { InterviewRole } from '../types';

type Props = {
  onSelectRole: (role: InterviewRole) => void;
};

export function RoleSelection({ onSelectRole }: Props) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Briefcase className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Choose Your Interview Type</h1>
        <p className="text-gray-600 mt-2">Select a role to start your personalized interview preparation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviewRoles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{role.title}</h3>
            <p className="text-gray-600">{role.description}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${
              role.category === 'technical' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {role.category === 'technical' ? 'Technical' : 'Non-Technical'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}