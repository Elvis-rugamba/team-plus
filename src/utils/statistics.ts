import type { AppState, Statistics, Availability } from '@/types';

/**
 * Calculates statistics from the current application state
 * Uses the roles and skills collections for O(1) lookups instead of iterating members
 */
export const calculateStatistics = (state: AppState): Statistics => {
  const members = Object.values(state.members);
  const teams = Object.values(state.teams);
  const roles = state.roles || {};
  const skills = state.skills || {};

  const totalMembers = members.length;
  const totalTeams = teams.length;
  const totalRoles = Object.keys(roles).length;
  const totalSkills = Object.keys(skills).length;

  // Average team size
  const averageTeamSize =
    totalTeams > 0
      ? teams.reduce((sum, team) => sum + team.memberIds.length, 0) / totalTeams
      : 0;

  // Skill distribution (by skill name)
  // O(n * m) where n is members and m is average skills per member
  const skillDistribution: Record<string, number> = {};
  members.forEach((member) => {
    member.skillIds.forEach((skillId) => {
      const skillName = skills[skillId]?.name || 'Unknown';
      skillDistribution[skillName] = (skillDistribution[skillName] || 0) + 1;
    });
  });

  // Availability distribution
  const availabilityDistribution: Record<Availability, number> = {
    AVAILABLE: 0,
    BUSY: 0,
    UNAVAILABLE: 0,
  };
  members.forEach((member) => {
    availabilityDistribution[member.availability]++;
  });

  // Role distribution (by role name)
  // O(n) where n is members - much faster than old implementation
  const roleDistribution: Record<string, number> = {};
  members.forEach((member) => {
    const roleName = roles[member.roleId]?.name || 'Unknown';
    roleDistribution[roleName] = (roleDistribution[roleName] || 0) + 1;
  });

  // Team target metrics
  let teamsWithTargets = 0;
  let teamsAtTargetSize = 0;
  let teamsBelowTargetSize = 0;
  let teamsAboveTargetSize = 0;
  
  // Track members by team to avoid double counting
  const membersInRoleTargetedTeams = new Set<string>();
  const membersInSkillTargetedTeams = new Set<string>();
  const membersMatchingTargetRoles = new Set<string>();
  const membersNotMatchingTargetRoles = new Set<string>();
  const membersMatchingTargetSkills = new Set<string>();
  const membersNotMatchingTargetSkills = new Set<string>();

  teams.forEach((team) => {
    const hasTargetCriteria = (team.targetRoles && team.targetRoles.length > 0) ||
                              (team.targetSkills && team.targetSkills.length > 0) ||
                              team.targetSize !== undefined;

    if (hasTargetCriteria) {
      teamsWithTargets++;
    }

    // Check target size
    if (team.targetSize !== undefined) {
      const currentSize = team.memberIds.length;
      if (currentSize === team.targetSize) {
        teamsAtTargetSize++;
      } else if (currentSize < team.targetSize) {
        teamsBelowTargetSize++;
      } else {
        teamsAboveTargetSize++;
      }
    }

    // Check target roles for team members
    if (team.targetRoles && team.targetRoles.length > 0) {
      team.memberIds.forEach((memberId) => {
        const member = state.members[memberId];
        if (member) {
          membersInRoleTargetedTeams.add(memberId);
          if (team.targetRoles!.includes(member.roleId)) {
            membersMatchingTargetRoles.add(memberId);
          } else {
            membersNotMatchingTargetRoles.add(memberId);
          }
        }
      });
    }

    // Check target skills for team members
    if (team.targetSkills && team.targetSkills.length > 0) {
      team.memberIds.forEach((memberId) => {
        const member = state.members[memberId];
        if (member) {
          membersInSkillTargetedTeams.add(memberId);
          const hasMatchingSkill = member.skillIds.some(skillId =>
            team.targetSkills!.includes(skillId)
          );
          if (hasMatchingSkill) {
            membersMatchingTargetSkills.add(memberId);
          } else {
            membersNotMatchingTargetSkills.add(memberId);
          }
        }
      });
    }
  });

  // Calculate coverage percentages
  const totalMembersInRoleTargetedTeams = membersInRoleTargetedTeams.size;
  const targetRoleCoverage = totalMembersInRoleTargetedTeams > 0
    ? (membersMatchingTargetRoles.size / totalMembersInRoleTargetedTeams) * 100
    : 0;

  const totalMembersInSkillTargetedTeams = membersInSkillTargetedTeams.size;
  const targetSkillCoverage = totalMembersInSkillTargetedTeams > 0
    ? (membersMatchingTargetSkills.size / totalMembersInSkillTargetedTeams) * 100
    : 0;

  const teamsWithTargetSize = teamsAtTargetSize + teamsBelowTargetSize + teamsAboveTargetSize;
  const targetSizeCoverage = teamsWithTargetSize > 0
    ? (teamsAtTargetSize / teamsWithTargetSize) * 100
    : 0;

  return {
    totalMembers,
    totalTeams,
    totalRoles,
    totalSkills,
    averageTeamSize,
    skillDistribution,
    availabilityDistribution,
    roleDistribution,
    teamsWithTargets,
    teamsAtTargetSize,
    teamsBelowTargetSize,
    teamsAboveTargetSize,
    membersMatchingTargetRoles: membersMatchingTargetRoles.size,
    membersNotMatchingTargetRoles: membersNotMatchingTargetRoles.size,
    membersMatchingTargetSkills: membersMatchingTargetSkills.size,
    membersNotMatchingTargetSkills: membersNotMatchingTargetSkills.size,
    targetRoleCoverage,
    targetSkillCoverage,
    targetSizeCoverage,
  };
};
