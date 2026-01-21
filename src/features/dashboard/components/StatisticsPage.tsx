import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TargetIcon from '@mui/icons-material/GpsFixed';
import { useTranslation } from 'react-i18next';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useAppContext } from '@/contexts/AppContext';
import { calculateStatistics } from '@/utils/statistics';
import { Availability, type Team, type Member } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.light`,
              color: `${color}.main`,
            }}
            aria-hidden="true"
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Statistics Dashboard Page
 * Displays comprehensive statistics about teams and members
 */
export const StatisticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAppContext();

  const stats = useMemo(() => {
    const calculated = calculateStatistics(state);
    return calculated;
  }, [state]);

  const availabilityData = useMemo(
    () => [
      {
        id: 'available',
        label: t('members.available'),
        value: stats.availabilityDistribution[Availability.AVAILABLE] || 0,
        color: '#4caf50',
      },
      {
        id: 'busy',
        label: t('members.busy'),
        value: stats.availabilityDistribution[Availability.BUSY] || 0,
        color: '#ff9800',
      },
      {
        id: 'unavailable',
        label: t('members.unavailable'),
        value: stats.availabilityDistribution[Availability.UNAVAILABLE] || 0,
        color: '#f44336',
      },
    ],
    [stats.availabilityDistribution, t]
  );

  const topSkills = useMemo(() => {
    return Object.entries(stats.skillDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [stats.skillDistribution]);

  const topSkillsPieData = useMemo(() => {
    const top5 = Object.entries(stats.skillDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];
    
    return top5.map(([skill, count], index) => ({
      id: skill,
      label: skill,
      value: count,
      color: colors[index],
    }));
  }, [stats.skillDistribution]);

  // Use totalSkills from stats instead of recalculating
  const totalUniqueSkills = stats.totalSkills;

  const roleData = useMemo(() => {
    return Object.entries(stats.roleDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [stats.roleDistribution]);

  const teamSizeData = useMemo(() => {
    return Object.values(state.teams).map((team) => ({
      team: team.name,
      size: team.memberIds.length,
      color: team.color || '#2e7d32',
    }));
  }, [state.teams]);

  const allSkillsData = useMemo(() => {
    return Object.entries(stats.skillDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);
  }, [stats.skillDistribution]);

  // Calculate comparison chart data for roles and skills
  const radarChartData = useMemo(() => {
    const { roles, skills, teams, members } = state;
    const teamsArray: Team[] = Object.values(teams);
    const membersArray: Member[] = Object.values(members);
    
    // Calculate target roles (how many teams need each role)
    const targetRolesCount: Record<string, number> = {};
    teamsArray.forEach((team) => {
      if (team.targetRoles) {
        team.targetRoles.forEach((roleId: string) => {
          const roleName = roles[roleId]?.name || 'Unknown';
          targetRolesCount[roleName] = (targetRolesCount[roleName] || 0) + 1;
        });
      }
    });

    // Calculate assigned roles (how many members have each role)
    const assignedRolesCount: Record<string, number> = {};
    membersArray.forEach((member) => {
      const roleName = roles[member.roleId]?.name || 'Unknown';
      assignedRolesCount[roleName] = (assignedRolesCount[roleName] || 0) + 1;
    });

    // Calculate target skills (how many teams need each skill)
    const targetSkillsCount: Record<string, number> = {};
    teamsArray.forEach((team) => {
      if (team.targetSkills) {
        team.targetSkills.forEach((skillId: string) => {
          const skillName = skills[skillId]?.name || 'Unknown';
          targetSkillsCount[skillName] = (targetSkillsCount[skillName] || 0) + 1;
        });
      }
    });

    // Calculate assigned skills (how many members have each skill)
    const assignedSkillsCount: Record<string, number> = {};
    membersArray.forEach((member) => {
      member.skillIds.forEach((skillId) => {
        const skillName = skills[skillId]?.name || 'Unknown';
        assignedSkillsCount[skillName] = (assignedSkillsCount[skillName] || 0) + 1;
      });
    });

    // Get all unique roles and skills
    const allRoles = new Set([...Object.keys(targetRolesCount), ...Object.keys(assignedRolesCount)]);
    const allSkills = new Set([...Object.keys(targetSkillsCount), ...Object.keys(assignedSkillsCount)]);

    // Find max values for normalization
    const maxTargetRoles = Math.max(...Object.values(targetRolesCount), 1);
    const maxAssignedRoles = Math.max(...Object.values(assignedRolesCount), 1);
    const maxTargetSkills = Math.max(...Object.values(targetSkillsCount), 1);
    const maxAssignedSkills = Math.max(...Object.values(assignedSkillsCount), 1);

    // Normalize to 0-100 scale
    const normalize = (value: number, max: number) => (value / max) * 100;

    // Prepare roles data
    const rolesData = Array.from(allRoles).map((roleName) => ({
      role: roleName,
      target: normalize(targetRolesCount[roleName] || 0, maxTargetRoles),
      assigned: normalize(assignedRolesCount[roleName] || 0, maxAssignedRoles),
    }));

    // Prepare skills data
    const skillsData = Array.from(allSkills).map((skillName) => ({
      skill: skillName,
      target: normalize(targetSkillsCount[skillName] || 0, maxTargetSkills),
      assigned: normalize(assignedSkillsCount[skillName] || 0, maxAssignedSkills),
    }));

    // Sort by target value (descending) and take top 10 for each
    const topRoles = rolesData
      .sort((a, b) => b.target - a.target)
      .slice(0, 10);
    
    const topSkills = skillsData
      .sort((a, b) => b.target - a.target)
      .slice(0, 10);

    return { roles: topRoles, skills: topSkills };
  }, [state]);

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('statistics.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of teams, members, skills, and availability
        </Typography>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.totalMembers')}
            value={stats.totalMembers}
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.totalTeams')}
            value={stats.totalTeams}
            icon={<GroupIcon sx={{ fontSize: 32 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.averageTeamSize')}
            value={stats.averageTeamSize.toFixed(1)}
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('statistics.totalSkills')}
            value={totalUniqueSkills}
            icon={<EmojiObjectsIcon sx={{ fontSize: 32 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Team Target Metrics Summary */}
      {stats.teamsWithTargets > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {t('statistics.teamTargetMetrics')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('statistics.teamsWithTargets')}
              value={stats.teamsWithTargets}
              icon={<TargetIcon sx={{ fontSize: 32 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('statistics.teamsAtTargetSize')}
              value={stats.teamsAtTargetSize}
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('statistics.targetRoleCoverage')}
              value={`${stats.targetRoleCoverage.toFixed(1)}%`}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('statistics.targetSkillCoverage')}
              value={`${stats.targetSkillCoverage.toFixed(1)}%`}
              icon={<EmojiObjectsIcon sx={{ fontSize: 32 }} />}
              color="secondary"
            />
          </Grid>
        </Grid>
      )}

      {stats.totalMembers === 0 && stats.totalTeams === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {t('statistics.noStatistics')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Availability Distribution */}
          {stats.totalMembers > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t('statistics.availabilityDistribution')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                    width: '100%',
                  }}
                >
                  {stats.totalMembers > 0 && availabilityData.some((d) => d.value > 0) ? (
                    <PieChart
                      series={[
                        {
                          data: availabilityData.filter((d) => d.value > 0),
                          highlightScope: { faded: 'global', highlighted: 'item' },
                          valueFormatter: (item) => `${item.value} ${t('statistics.membersWithSkill')}`,
                        },
                      ]}
                      width={400}
                      height={300}
                      slotProps={{
                        legend: {
                          direction: 'column',
                          position: { vertical: 'middle', horizontal: 'right' },
                        },
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('common.noData')}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Skill Distribution - Pie Chart */}
          {topSkillsPieData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t('statistics.skillDistribution')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Top 5 skills by member count
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 350,
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: topSkillsPieData,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        valueFormatter: (item) => `${item.value} ${t('statistics.membersWithSkill')}`,
                        innerRadius: 30,
                        outerRadius: 120,
                        paddingAngle: 2,
                        cornerRadius: 5,
                      },
                    ]}
                    width={500}
                    height={350}
                    slotProps={{
                      legend: {
                        direction: 'column',
                        position: { vertical: 'middle', horizontal: 'right' },
                        padding: 0,
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Skill Distribution - Bar Chart */}
          {topSkills.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t('statistics.topSkills')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Top 10 most common skills
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 350,
                  }}
                >
                  <BarChart
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: topSkills.map(([skill]) => skill),
                      },
                    ]}
                    series={[
                      {
                        data: topSkills.map(([, count]) => count),
                        label: t('statistics.membersWithSkill'),
                        color: '#1976d2',
                      },
                    ]}
                    width={500}
                    height={350}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* All Skills - Horizontal Bar Chart */}
          {allSkillsData.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('statistics.skillDistribution')} - {t('statistics.detailedView')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Top 15 skills with member counts
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 450,
                  }}
                >
                  <BarChart
                    layout="horizontal"
                    yAxis={[
                      {
                        scaleType: 'band',
                        data: allSkillsData.map(([skill]) => skill),
                      },
                    ]}
                    series={[
                      {
                        data: allSkillsData.map(([, count]) => count),
                        label: t('statistics.membersWithSkill'),
                        color: '#ed6c02',
                      },
                    ]}
                    width={900}
                    height={450}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Role Distribution */}
          {roleData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {t('statistics.roleDistribution')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                  }}
                >
                  <BarChart
                    layout="horizontal"
                    yAxis={[
                      {
                        scaleType: 'band',
                        data: roleData.map(([role]) => role),
                      },
                    ]}
                    series={[
                      {
                        data: roleData.map(([, count]) => count),
                        label: 'Members',
                        color: '#9c27b0',
                      },
                    ]}
                    width={500}
                    height={300}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Team Sizes */}
          {teamSizeData.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('statistics.teamSizes')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member count per team (colored by team)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 300,
                  }}
                >
                  <BarChart
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: teamSizeData.map((t) => t.team),
                      },
                    ]}
                    series={teamSizeData.map((team, index) => ({
                      data: teamSizeData.map((_, i) => (i === index ? team.size : 0)),
                      label: team.team,
                      color: team.color,
                      stack: 'total',
                    }))}
                    width={900}
                    height={300}
                    slotProps={{
                      legend: {
                        hidden: false,
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Team Target Metrics Section */}
          {stats.teamsWithTargets > 0 && (
            <>
              {/* Target Size Distribution */}
              {(stats.teamsAtTargetSize > 0 || stats.teamsBelowTargetSize > 0 || stats.teamsAboveTargetSize > 0) && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {t('statistics.targetSizeDistribution')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('statistics.targetSizeDistributionDescription')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                      }}
                    >
                      <PieChart
                        series={[
                          {
                            data: [
                              {
                                id: 'atTarget',
                                label: t('statistics.atTargetSize'),
                                value: stats.teamsAtTargetSize,
                                color: '#4caf50',
                              },
                              {
                                id: 'belowTarget',
                                label: t('statistics.belowTargetSize'),
                                value: stats.teamsBelowTargetSize,
                                color: '#ff9800',
                              },
                              {
                                id: 'aboveTarget',
                                label: t('statistics.aboveTargetSize'),
                                value: stats.teamsAboveTargetSize,
                                color: '#f44336',
                              },
                            ].filter(item => item.value > 0),
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            valueFormatter: (item) => `${item.value} ${t('statistics.teams')}`,
                          },
                        ]}
                        width={400}
                        height={300}
                        slotProps={{
                          legend: {
                            direction: 'column',
                            position: { vertical: 'middle', horizontal: 'right' },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Target Role Match Distribution */}
              {(stats.membersMatchingTargetRoles > 0 || stats.membersNotMatchingTargetRoles > 0) && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {t('statistics.targetRoleMatch')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('statistics.targetRoleMatchDescription')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                      }}
                    >
                      <PieChart
                        series={[
                          {
                            data: [
                              {
                                id: 'matching',
                                label: t('statistics.matchingTargetRoles'),
                                value: stats.membersMatchingTargetRoles,
                                color: '#4caf50',
                              },
                              {
                                id: 'notMatching',
                                label: t('statistics.notMatchingTargetRoles'),
                                value: stats.membersNotMatchingTargetRoles,
                                color: '#f44336',
                              },
                            ].filter(item => item.value > 0),
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            valueFormatter: (item) => `${item.value} ${t('statistics.members')}`,
                          },
                        ]}
                        width={400}
                        height={300}
                        slotProps={{
                          legend: {
                            direction: 'column',
                            position: { vertical: 'middle', horizontal: 'right' },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Target Skill Match Distribution */}
              {(stats.membersMatchingTargetSkills > 0 || stats.membersNotMatchingTargetSkills > 0) && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {t('statistics.targetSkillMatch')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('statistics.targetSkillMatchDescription')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                      }}
                    >
                      <PieChart
                        series={[
                          {
                            data: [
                              {
                                id: 'matching',
                                label: t('statistics.matchingTargetSkills'),
                                value: stats.membersMatchingTargetSkills,
                                color: '#4caf50',
                              },
                              {
                                id: 'notMatching',
                                label: t('statistics.notMatchingTargetSkills'),
                                value: stats.membersNotMatchingTargetSkills,
                                color: '#f44336',
                              },
                            ].filter(item => item.value > 0),
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            valueFormatter: (item) => `${item.value} ${t('statistics.members')}`,
                          },
                        ]}
                        width={400}
                        height={300}
                        slotProps={{
                          legend: {
                            direction: 'column',
                            position: { vertical: 'middle', horizontal: 'right' },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Target vs Assigned Comparison Charts */}
              {(radarChartData.roles.length > 0 || radarChartData.skills.length > 0) && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('statistics.rolesComparisonChart')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('statistics.rolesComparisonChartDescription')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                      }}
                    >
                      <BarChart
                        xAxis={[
                          {
                            scaleType: 'band',
                            data: radarChartData.roles.map((r) => r.role),
                          },
                        ]}
                        series={[
                          {
                            data: radarChartData.roles.map((r) => r.target),
                            label: t('statistics.targetRoles'),
                            color: '#1976d2',
                          },
                          {
                            data: radarChartData.roles.map((r) => r.assigned),
                            label: t('statistics.assignedRoles'),
                            color: '#2e7d32',
                          },
                        ]}
                        width={800}
                        height={400}
                        slotProps={{
                          legend: {
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'middle' },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}

              {(radarChartData.skills.length > 0) && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('statistics.skillsComparisonChart')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('statistics.skillsComparisonChartDescription')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                      }}
                    >
                      <BarChart
                        xAxis={[
                          {
                            scaleType: 'band',
                            data: radarChartData.skills.map((s) => s.skill),
                          },
                        ]}
                        series={[
                          {
                            data: radarChartData.skills.map((s) => s.target),
                            label: t('statistics.targetSkills'),
                            color: '#ed6c02',
                          },
                          {
                            data: radarChartData.skills.map((s) => s.assigned),
                            label: t('statistics.assignedSkills'),
                            color: '#9c27b0',
                          },
                        ]}
                        width={800}
                        height={400}
                        slotProps={{
                          legend: {
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'middle' },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </Grid>
      )}
    </Box>
  );
};
