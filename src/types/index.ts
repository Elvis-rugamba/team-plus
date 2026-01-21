export type MemberId = string;
export type TeamId = string;
export type RoleId = string;
export type SkillId = string;

export enum Availability {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
}

/**
 * Role entity - stored separately for performance
 */
export interface Role {
  id: RoleId;
  name: string;
  createdAt: string;
}

/**
 * Skill entity - stored separately for performance
 */
export interface Skill {
  id: SkillId;
  name: string;
  createdAt: string;
}

export interface Member {
  id: MemberId;
  name: string;
  roleId: RoleId;        // Reference to Role by ID
  skillIds: SkillId[];   // References to Skills by IDs
  availability: Availability;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: TeamId;
  name: string;
  description: string;
  memberIds: MemberId[];
  createdAt: string;
  updatedAt: string;
  color?: string;
  targetRoles?: RoleId[];      // Target roles for this team
  targetSkills?: SkillId[];    // Target skills for this team
  targetSize?: number;          // Target team size
}

export interface AppState {
  members: Record<MemberId, Member>;
  teams: Record<TeamId, Team>;
  roles: Record<RoleId, Role>;     // Roles collection
  skills: Record<SkillId, Skill>;  // Skills collection
  darkMode: boolean;
  language: 'en' | 'de';
}

export type ViewMode = 'table' | 'list' | 'grid';

export interface FilterOptions {
  searchTerm: string;
  roles: RoleId[];
  skills: SkillId[];
  availability: Availability[];
  teams: TeamId[];
}

export interface Statistics {
  totalMembers: number;
  totalTeams: number;
  totalRoles: number;
  totalSkills: number;
  averageTeamSize: number;
  skillDistribution: Record<string, number>;
  availabilityDistribution: Record<Availability, number>;
  roleDistribution: Record<string, number>;
  // Team target metrics
  teamsWithTargets: number;
  teamsAtTargetSize: number;
  teamsBelowTargetSize: number;
  teamsAboveTargetSize: number;
  membersMatchingTargetRoles: number;
  membersNotMatchingTargetRoles: number;
  membersMatchingTargetSkills: number;
  membersNotMatchingTargetSkills: number;
  targetRoleCoverage: number; // Percentage of members matching target roles
  targetSkillCoverage: number; // Percentage of members matching target skills
  targetSizeCoverage: number; // Percentage of teams at target size
}

export type ExportFormat = 'json' | 'csv';

// Action types for reducer
export enum ActionType {
  // Member actions
  ADD_MEMBER = 'ADD_MEMBER',
  UPDATE_MEMBER = 'UPDATE_MEMBER',
  DELETE_MEMBER = 'DELETE_MEMBER',
  
  // Team actions
  ADD_TEAM = 'ADD_TEAM',
  UPDATE_TEAM = 'UPDATE_TEAM',
  DELETE_TEAM = 'DELETE_TEAM',
  
  // Role actions
  ADD_ROLE = 'ADD_ROLE',
  UPDATE_ROLE = 'UPDATE_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
  
  // Skill actions
  ADD_SKILL = 'ADD_SKILL',
  UPDATE_SKILL = 'UPDATE_SKILL',
  DELETE_SKILL = 'DELETE_SKILL',
  
  // Assignment actions
  ASSIGN_MEMBER_TO_TEAM = 'ASSIGN_MEMBER_TO_TEAM',
  REMOVE_MEMBER_FROM_TEAM = 'REMOVE_MEMBER_FROM_TEAM',
  ASSIGN_MEMBERS_TO_TEAM = 'ASSIGN_MEMBERS_TO_TEAM',
  
  // UI actions
  TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE',
  SET_LANGUAGE = 'SET_LANGUAGE',
  
  // Data actions
  LOAD_STATE = 'LOAD_STATE',
  RESET_STATE = 'RESET_STATE',
}

export type Action =
  | { type: ActionType.ADD_MEMBER; payload: Member }
  | { type: ActionType.UPDATE_MEMBER; payload: Member }
  | { type: ActionType.DELETE_MEMBER; payload: MemberId }
  | { type: ActionType.ADD_TEAM; payload: Team }
  | { type: ActionType.UPDATE_TEAM; payload: Team }
  | { type: ActionType.DELETE_TEAM; payload: TeamId }
  | { type: ActionType.ADD_ROLE; payload: Role }
  | { type: ActionType.UPDATE_ROLE; payload: Role }
  | { type: ActionType.DELETE_ROLE; payload: RoleId }
  | { type: ActionType.ADD_SKILL; payload: Skill }
  | { type: ActionType.UPDATE_SKILL; payload: Skill }
  | { type: ActionType.DELETE_SKILL; payload: SkillId }
  | { type: ActionType.ASSIGN_MEMBER_TO_TEAM; payload: { memberId: MemberId; teamId: TeamId } }
  | { type: ActionType.REMOVE_MEMBER_FROM_TEAM; payload: { memberId: MemberId; teamId: TeamId } }
  | { type: ActionType.ASSIGN_MEMBERS_TO_TEAM; payload: { memberIds: MemberId[]; teamId: TeamId } }
  | { type: ActionType.TOGGLE_DARK_MODE }
  | { type: ActionType.SET_LANGUAGE; payload: 'en' | 'de' }
  | { type: ActionType.LOAD_STATE; payload: AppState }
  | { type: ActionType.RESET_STATE };

/**
 * Helper type for member form data (uses names instead of IDs for UI)
 */
export interface MemberFormData {
  name: string;
  role: string;      // Role name (resolved to ID when saving)
  skills: string[];  // Skill names (resolved to IDs when saving)
  availability: Availability;
  email?: string;
}
