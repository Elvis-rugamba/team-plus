import type { AppState, Member, Team, ExportFormat } from '@/types';

/**
 * Exports application data in the specified format
 */
export const exportData = (
  state: AppState,
  format: ExportFormat,
  filename: string
): void => {
  let content: string;
  let mimeType: string;

  if (format === 'json') {
    content = JSON.stringify(state, null, 2);
    mimeType = 'application/json';
  } else {
    content = convertToCSV(state);
    mimeType = 'text/csv';
  }

  downloadFile(content, filename, mimeType);
};

/**
 * Helper to get role name from roleId
 */
const getRoleName = (state: AppState, roleId: string): string => {
  return state.roles?.[roleId]?.name || roleId;
};

/**
 * Helper to get skill names from skillIds
 */
const getSkillNames = (state: AppState, skillIds: string[]): string[] => {
  return skillIds.map(id => state.skills?.[id]?.name || id);
};

/**
 * Converts state to CSV format
 */
const convertToCSV = (state: AppState): string => {
  const members = Object.values(state.members);
  const teams = Object.values(state.teams);

  // Members CSV - resolve role and skill IDs to names
  const membersCSV = [
    'Type,ID,Name,Role,Skills,Availability,Email,Created,Updated',
    ...members.map((m: Member) =>
      [
        'Member',
        m.id,
        `"${m.name}"`,
        `"${getRoleName(state, m.roleId)}"`,
        `"${getSkillNames(state, m.skillIds).join(', ')}"`,
        m.availability,
        m.email || '',
        m.createdAt,
        m.updatedAt,
      ].join(',')
    ),
  ].join('\n');

  // Teams CSV
  const teamsCSV = [
    '\n\nType,ID,Name,Description,Member Count,Member IDs,Created,Updated',
    ...teams.map((t: Team) =>
      [
        'Team',
        t.id,
        `"${t.name}"`,
        `"${t.description}"`,
        t.memberIds.length,
        `"${t.memberIds.join(', ')}"`,
        t.createdAt,
        t.updatedAt,
      ].join(',')
    ),
  ].join('\n');

  // Roles CSV
  const roles = Object.values(state.roles || {});
  const rolesCSV = roles.length > 0 ? [
    '\n\nType,ID,Name,Created',
    ...roles.map((r) =>
      [
        'Role',
        r.id,
        `"${r.name}"`,
        r.createdAt,
      ].join(',')
    ),
  ].join('\n') : '';

  // Skills CSV
  const skills = Object.values(state.skills || {});
  const skillsCSV = skills.length > 0 ? [
    '\n\nType,ID,Name,Created',
    ...skills.map((s) =>
      [
        'Skill',
        s.id,
        `"${s.name}"`,
        s.createdAt,
      ].join(',')
    ),
  ].join('\n') : '';

  return membersCSV + teamsCSV + rolesCSV + skillsCSV;
};

/**
 * Triggers download of a file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
