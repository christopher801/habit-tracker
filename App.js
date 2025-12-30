import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('today');

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const stored = await AsyncStorage.getItem('habits');
      if (stored) {
        setHabits(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading habits:', error);
    }
  };

  const saveHabits = async (updatedHabits) => {
    try {
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit = {
        id: Date.now(),
        name: newHabit,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      saveHabits([...habits, habit]);
      setNewHabit('');
    }
  };

  const toggleHabit = (habitId) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const dates = [...habit.completedDates];
        const index = dates.indexOf(selectedDate);
        if (index > -1) {
          dates.splice(index, 1);
        } else {
          dates.push(selectedDate);
        }
        return { ...habit, completedDates: dates };
      }
      return habit;
    });
    saveHabits(updatedHabits);
  };

  const deleteHabit = (habitId) => {
    Alert.alert(
      'Efase Abitid',
      'Èske ou sèten ou vle efase abitid sa a?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Wi',
          onPress: () => saveHabits(habits.filter((h) => h.id !== habitId)),
          style: 'destructive',
        },
      ]
    );
  };

  const isHabitCompleted = (habit) => {
    return habit.completedDates.includes(selectedDate);
  };

  const getStreak = (habit) => {
    let streak = 0;
    const today = new Date();
    const sortedDates = [...habit.completedDates].sort().reverse();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (sortedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getCompletionRate = (habit) => {
    const last7Days = getLast7Days();
    const completed = last7Days.filter((date) =>
      habit.completedDates.includes(date)
    ).length;
    return Math.round((completed / 7) * 100);
  };

  const changeDate = (direction) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ht-HT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>📅 Habit Tracker</Text>
          <Text style={styles.subtitle}>Swiv abitid ou yo chak jou</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newHabit}
              onChangeText={setNewHabit}
              placeholder="Ajoute yon nouvo abitid..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.addButton} onPress={addHabit}>
              <Text style={styles.addButtonText}>➕ Ajoute</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewSelector}>
            <TouchableOpacity
              style={[styles.viewButton, view === 'today' && styles.viewButtonActive]}
              onPress={() => setView('today')}
            >
              <Text style={[styles.viewButtonText, view === 'today' && styles.viewButtonTextActive]}>
                Jodi a
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, view === 'stats' && styles.viewButtonActive]}
              onPress={() => setView('stats')}
            >
              <Text style={[styles.viewButtonText, view === 'stats' && styles.viewButtonTextActive]}>
                📊 Estatistik
              </Text>
            </TouchableOpacity>
          </View>

          {view === 'today' && (
            <View>
              <View style={styles.dateSelector}>
                <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(-1)}>
                  <Text style={styles.dateButtonText}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(1)}>
                  <Text style={styles.dateButtonText}>▶</Text>
                </TouchableOpacity>
              </View>

              {habits.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Pa gen abitid ankò. Ajoute youn pou kòmanse!
                  </Text>
                </View>
              ) : (
                <View style={styles.habitsList}>
                  {habits.map((habit) => (
                    <View
                      key={habit.id}
                      style={[
                        styles.habitItem,
                        isHabitCompleted(habit) && styles.habitItemCompleted,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          isHabitCompleted(habit) && styles.checkboxCompleted,
                        ]}
                        onPress={() => toggleHabit(habit.id)}
                      >
                        {isHabitCompleted(habit) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>
                          🔥 {getStreak(habit)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => deleteHabit(habit.id)}>
                        <Text style={styles.deleteButton}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {view === 'stats' && (
            <View style={styles.statsContainer}>
              {habits.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Pa gen done pou montre</Text>
                </View>
              ) : (
                habits.map((habit) => {
                  const last7Days = getLast7Days();
                  return (
                    <View key={habit.id} style={styles.statCard}>
                      <View style={styles.statHeader}>
                        <Text style={styles.statTitle}>{habit.name}</Text>
                        <Text style={styles.statPercentage}>
                          {getCompletionRate(habit)}%
                        </Text>
                      </View>
                      <View style={styles.weekGrid}>
                        {last7Days.map((date) => {
                          const isCompleted = habit.completedDates.includes(date);
                          const dayName = new Date(date)
                            .toLocaleDateString('ht-HT', { weekday: 'short' })
                            .substring(0, 3);
                          return (
                            <View key={date} style={styles.dayColumn}>
                              <Text style={styles.dayLabel}>{dayName}</Text>
                              <View
                                style={[
                                  styles.dayBar,
                                  isCompleted && styles.dayBarCompleted,
                                ]}
                              />
                            </View>
                          );
                        })}
                      </View>
                      <View style={styles.statFooter}>
                        <Text style={styles.statInfo}>
                          🔥 Streak: {getStreak(habit)} jou
                        </Text>
                        <Text style={styles.statInfo}>
                          ✅ Total: {habit.completedDates.length} jou
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 HabitTracker - Created by Christopher⚡</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#8B5CF6',
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E9D5FF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  viewSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  viewButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  viewButtonTextActive: {
    color: '#FFFFFF',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  dateButton: {
    padding: 8,
  },
  dateButtonText: {
    fontSize: 20,
    color: '#8B5CF6',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  habitItemCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#86EFAC',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  streakBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 14,
    color: '#4B5563',
  },
  deleteButton: {
    fontSize: 20,
    padding: 4,
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  dayBar: {
    width: '100%',
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  dayBarCompleted: {
    backgroundColor: '#22C55E',
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});