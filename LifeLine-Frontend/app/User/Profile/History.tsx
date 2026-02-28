import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useMemo, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'

type HistoryType = 'medical' | 'security' | 'fire'
type StatusType = 'resolved' | 'cancelled'
type HistoryFilter = 'All' | 'Medical' | 'Security' | 'Fire'

type Helper = {
  id: string
  name: string
  role: string
}

type HistoryItem = {
  id: string
  type: HistoryType
  title: string
  date: string
  monthGroup: string
  status: StatusType
  helpers?: Helper[]
  note?: string
}

const MOCK_DATA: HistoryItem[] = [
  {
    id: '1',
    type: 'medical',
    title: 'Medical Emergency',
    date: 'Oct 12 • 14:30 PM',
    monthGroup: 'October 2023',
    status: 'resolved',
    helpers: [
      { id: 'h1', name: 'Paramedic Sarah Jenkins', role: 'Primary Helper' },
      { id: 'h2', name: 'Dr. Michael Ross', role: 'Medical Supervisor' },
    ],
  },
  {
    id: '2',
    type: 'security',
    title: 'Security Alert',
    date: 'Oct 05 • 22:15 PM',
    monthGroup: 'October 2023',
    status: 'cancelled',
    note: 'User deactivated SOS before helper arrival.',
  },
  {
    id: '3',
    type: 'fire',
    title: 'Fire Hazard Report',
    date: 'Sep 28 • 09:12 AM',
    monthGroup: 'September 2023',
    status: 'resolved',
    helpers: [{ id: 'h3', name: 'Officer David Miller', role: 'Primary Helper' }],
  },
]

const FILTERS: HistoryFilter[] = ['All', 'Medical', 'Security', 'Fire']

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('All')

  const filteredData = useMemo(() => {
    if (activeFilter === 'All') {
      return MOCK_DATA
    }

    return MOCK_DATA.filter((item) => item.type === activeFilter.toLowerCase())
  }, [activeFilter])

  const groupedData = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = {}

    for (const item of filteredData) {
      if (!groups[item.monthGroup]) {
        groups[item.monthGroup] = []
      }
      groups[item.monthGroup].push(item)
    }

    return Object.entries(groups)
  }, [filteredData])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterBtn, activeFilter === filter && styles.activeFilter]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={groupedData}
        keyExtractor={(item) => item[0]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <MonthSection month={item[0]} items={item[1]} />}
      />

      <Text style={styles.endText}>END OF ACTIVITY</Text>
    </View>
  )
}

function MonthSection({ month, items }: { month: string; items: HistoryItem[] }) {
  return (
    <View style={styles.monthContainer}>
      <Text style={styles.monthText}>{month.toUpperCase()}</Text>
      {items.map((item) => (
        <HistoryCard key={item.id} item={item} />
      ))}
    </View>
  )
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const icon = (() => {
    switch (item.type) {
      case 'medical':
        return { name: 'medkit' as const, color: '#EF4444' }
      case 'security':
        return { name: 'shield-checkmark' as const, color: '#3B82F6' }
      case 'fire':
        return { name: 'flame' as const, color: '#F97316' }
      default:
        return { name: 'alert' as const, color: '#6B7280' }
    }
  })()

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>

        <StatusBadge status={item.status} />
      </View>

      {item.helpers && item.helpers.length > 0 ? (
        <View style={styles.helpersContainer}>
          {item.helpers.map((helper) => (
            <View key={helper.id} style={styles.helperRow}>
              <View>
                <Text style={styles.helperLabel}>{helper.role}</Text>
                <Text style={styles.helperName}>{helper.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </View>
          ))}
        </View>
      ) : null}

      {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
    </View>
  )
}

function StatusBadge({ status }: { status: StatusType }) {
  const isResolved = status === 'resolved'

  return (
    <View style={[styles.badge, { backgroundColor: isResolved ? '#DCFCE7' : '#E5E7EB' }]}>
      <Text
        style={[
          styles.badgeText,
          { color: isResolved ? '#16A34A' : '#6B7280' },
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
  },
  title: {
    fontSize: hp('3%'),
    fontWeight: '800',
    marginBottom: hp('2%'),
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('3%'),
  },
  filterBtn: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: wp('3%'),
    marginBottom: hp('1%'),
  },
  activeFilter: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    color: '#374151',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: hp('10%'),
  },
  monthContainer: {
    marginBottom: hp('3%'),
  },
  monthText: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: hp('1%'),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  iconBox: {
    width: hp('5%'),
    height: hp('5%'),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: hp('1.8%'),
  },
  date: {
    color: '#6B7280',
    fontSize: hp('1.3%'),
  },
  badge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: 20,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: hp('1.2%'),
  },
  helpersContainer: {
    marginTop: hp('2%'),
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  helperLabel: {
    fontSize: hp('1.2%'),
    color: '#6B7280',
  },
  helperName: {
    fontWeight: '600',
  },
  note: {
    marginTop: hp('1%'),
    fontStyle: 'italic',
    color: '#6B7280',
  },
  endText: {
    textAlign: 'center',
    marginTop: hp('2%'),
    color: '#9CA3AF',
    fontSize: hp('1.3%'),
  },
})
