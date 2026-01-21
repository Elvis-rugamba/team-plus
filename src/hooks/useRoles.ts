import { useCallback, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ActionType } from '@/types';
import type { Role, RoleId } from '@/types';
import { generateId } from '@/utils/idGenerator';

/**
 * Hook for managing roles
 * Provides CRUD operations and lookup functions for roles
 */
export const useRoles = () => {
  const { state, dispatch } = useAppContext();

  // Get all roles as array (sorted by name)
  const roles = useMemo(() => {
    return Object.values(state.roles).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.roles]);

  // Get all role names (for autocomplete)
  const roleNames = useMemo(() => {
    return roles.map(role => role.name);
  }, [roles]);

  // Get role by ID
  const getRoleById = useCallback(
    (roleId: RoleId): Role | undefined => {
      return state.roles[roleId];
    },
    [state.roles]
  );

  // Get role name by ID (with fallback)
  const getRoleName = useCallback(
    (roleId: RoleId): string => {
      return state.roles[roleId]?.name || '';
    },
    [state.roles]
  );

  // Find role by name (case-insensitive)
  const findRoleByName = useCallback(
    (name: string): Role | undefined => {
      const lowerName = name.toLowerCase();
      return roles.find(role => role.name.toLowerCase() === lowerName);
    },
    [roles]
  );

  // Get role ID by name, or create new role if not exists
  const getOrCreateRoleId = useCallback(
    (name: string): RoleId => {
      const trimmedName = name.trim();
      const existingRole = findRoleByName(trimmedName);
      
      if (existingRole) {
        return existingRole.id;
      }

      // Create new role
      const newRole: Role = {
        id: generateId(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ActionType.ADD_ROLE, payload: newRole });
      return newRole.id;
    },
    [findRoleByName, dispatch]
  );

  // Add a new role
  const addRole = useCallback(
    (name: string): Role => {
      const trimmedName = name.trim();
      const newRole: Role = {
        id: generateId(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ActionType.ADD_ROLE, payload: newRole });
      return newRole;
    },
    [dispatch]
  );

  // Update a role
  const updateRole = useCallback(
    (role: Role) => {
      dispatch({ type: ActionType.UPDATE_ROLE, payload: role });
    },
    [dispatch]
  );

  // Delete a role
  const deleteRole = useCallback(
    (roleId: RoleId) => {
      dispatch({ type: ActionType.DELETE_ROLE, payload: roleId });
    },
    [dispatch]
  );

  // Check if role exists by name
  const roleExists = useCallback(
    (name: string): boolean => {
      return findRoleByName(name) !== undefined;
    },
    [findRoleByName]
  );

  return {
    roles,
    roleNames,
    getRoleById,
    getRoleName,
    findRoleByName,
    getOrCreateRoleId,
    addRole,
    updateRole,
    deleteRole,
    roleExists,
  };
};
