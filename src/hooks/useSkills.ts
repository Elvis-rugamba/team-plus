import { useCallback, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ActionType } from '@/types';
import type { Skill, SkillId } from '@/types';
import { generateId } from '@/utils/idGenerator';

/**
 * Hook for managing skills
 * Provides CRUD operations and lookup functions for skills
 */
export const useSkills = () => {
  const { state, dispatch } = useAppContext();

  // Get all skills as array (sorted by name)
  const skills = useMemo(() => {
    return Object.values(state.skills).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.skills]);

  // Get all skill names (for autocomplete)
  const skillNames = useMemo(() => {
    return skills.map(skill => skill.name);
  }, [skills]);

  // Get skill by ID
  const getSkillById = useCallback(
    (skillId: SkillId): Skill | undefined => {
      return state.skills[skillId];
    },
    [state.skills]
  );

  // Get skill name by ID (with fallback)
  const getSkillName = useCallback(
    (skillId: SkillId): string => {
      return state.skills[skillId]?.name || '';
    },
    [state.skills]
  );

  // Get multiple skill names by IDs
  const getSkillNames = useCallback(
    (skillIds: SkillId[]): string[] => {
      return skillIds
        .map(id => state.skills[id]?.name)
        .filter((name): name is string => name !== undefined);
    },
    [state.skills]
  );

  // Find skill by name (case-insensitive)
  const findSkillByName = useCallback(
    (name: string): Skill | undefined => {
      const lowerName = name.toLowerCase();
      return skills.find(skill => skill.name.toLowerCase() === lowerName);
    },
    [skills]
  );

  // Get skill ID by name, or create new skill if not exists
  const getOrCreateSkillId = useCallback(
    (name: string): SkillId => {
      const trimmedName = name.trim();
      const existingSkill = findSkillByName(trimmedName);
      
      if (existingSkill) {
        return existingSkill.id;
      }

      // Create new skill
      const newSkill: Skill = {
        id: generateId(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ActionType.ADD_SKILL, payload: newSkill });
      return newSkill.id;
    },
    [findSkillByName, dispatch]
  );

  // Get or create multiple skill IDs from names
  const getOrCreateSkillIds = useCallback(
    (names: string[]): SkillId[] => {
      return names.map(name => getOrCreateSkillId(name));
    },
    [getOrCreateSkillId]
  );

  // Add a new skill
  const addSkill = useCallback(
    (name: string): Skill => {
      const trimmedName = name.trim();
      const newSkill: Skill = {
        id: generateId(),
        name: trimmedName,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ActionType.ADD_SKILL, payload: newSkill });
      return newSkill;
    },
    [dispatch]
  );

  // Update a skill
  const updateSkill = useCallback(
    (skill: Skill) => {
      dispatch({ type: ActionType.UPDATE_SKILL, payload: skill });
    },
    [dispatch]
  );

  // Delete a skill
  const deleteSkill = useCallback(
    (skillId: SkillId) => {
      dispatch({ type: ActionType.DELETE_SKILL, payload: skillId });
    },
    [dispatch]
  );

  // Check if skill exists by name
  const skillExists = useCallback(
    (name: string): boolean => {
      return findSkillByName(name) !== undefined;
    },
    [findSkillByName]
  );

  return {
    skills,
    skillNames,
    getSkillById,
    getSkillName,
    getSkillNames,
    findSkillByName,
    getOrCreateSkillId,
    getOrCreateSkillIds,
    addSkill,
    updateSkill,
    deleteSkill,
    skillExists,
  };
};
