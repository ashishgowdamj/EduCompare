import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCompare } from '../../contexts/CompareContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import * as Animatable from 'react-native-animatable';
import { API } from '../../utils/api';

// Use shared API util for base URL
const { width } = Dimensions.get('window');

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  logo_base64?: string;
  images_base64: string[];
  ranking?: number;
  star_rating: number;
  annual_fees: number;
  courses_offered: string[];
  university_type: string;
  established_year: number;
  campus_size: string;
  total_students: number;
  faculty_count: number;
  placement_percentage: number;
  average_package: number;
  highest_package: number;
  hostel_facilities: boolean;
  library_facilities: boolean;
  sports_facilities: boolean;
  wifi: boolean;
  canteen: boolean;
  medical_facilities: boolean;
  description: string;
  admission_process: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: string;
  accreditation: string[];
}

export default function CollegeDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ title: '', body: '', rating: 4.5 });
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [cutoffs, setCutoffs] = useState<any[]>([]);
  const [cutoffsLoading, setCutoffsLoading] = useState(false);
  const [seats, setSeats] = useState<any[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [cutoffFilters, setCutoffFilters] = useState<{ year?: number; exam?: string; category?: string }>(() => ({}));

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { addToBrowsingHistory } = usePreferences();

  useEffect(() => {
    if (id) {
      fetchCollegeDetails();
      // Track browsing history
      const startTime = Date.now();
      addToBrowsingHistory({
        collegeId: id,
        action: 'view'
      });
      
      // Track viewing duration on unmount
      return () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        addToBrowsingHistory({
          collegeId: id,
          action: 'view',
          duration
        });
      };
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'reviews') {
      loadReviews();
    }
    if (id && activeTab === 'cutoffs') {
      loadCutoffs();
      loadSeats();
    }
  }, [id, activeTab]);

  // Re-query cutoffs when filters change while on the cutoffs tab
  useEffect(() => {
    if (id && activeTab === 'cutoffs') {
      loadCutoffs();
    }
  }, [cutoffFilters]);

  const fetchCollegeDetails = async () => {
    try {
      const response = await fetch(API.url(`/api/colleges/${id}`));
      if (response.ok) {
        const data = await response.json();
        setCollege(data);
      }
    } catch (error) {
      console.error('Error fetching college details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCutoffs = async () => {
    if (!id) return;
    try {
      setCutoffsLoading(true);
      const qp = new URLSearchParams();
      qp.append('college_id', String(id));
      if (cutoffFilters.year) qp.append('year', String(cutoffFilters.year));
      if (cutoffFilters.exam) qp.append('exam', cutoffFilters.exam);
      if (cutoffFilters.category) qp.append('category', cutoffFilters.category);
      const res = await fetch(API.url(`/api/cutoffs?${qp.toString()}`));
      if (res.ok) {
        const data = await res.json();
        setCutoffs(data.items || []);
      }
    } catch (e) {
      console.log('cutoffs load error', e);
    } finally {
      setCutoffsLoading(false);
    }
  };

  const loadSeats = async () => {
    if (!id) return;
    try {
      setSeatsLoading(true);
      const qp = new URLSearchParams();
      qp.append('college_id', String(id));
      const res = await fetch(API.url(`/api/seats?${qp.toString()}`));
      if (res.ok) {
        const data = await res.json();
        setSeats(data.items || []);
      }
    } catch (e) {
      console.log('seats load error', e);
    } finally {
      setSeatsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(API.url(`/api/reviews/${id}?page=1&limit=10&sort=recent`));
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.log('reviews load error', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatFees = (fees: number) => {
    if (fees >= 100000) {
      return `₹${(fees / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${(fees / 1000).toFixed(0)} Thousand`;
  };

  const formatPackage = (packageAmount: number) => {
    if (packageAmount >= 100000) {
      return `₹${(packageAmount / 100000).toFixed(1)} LPA`;
    }
    return `₹${(packageAmount / 1000).toFixed(0)} Thousand`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />);
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const handleFavoriteToggle = () => {
    if (!college) return;
    
    if (isFavorite(college.id)) {
      removeFromFavorites(college.id);
    } else {
      addToFavorites(college);
    }
  };

  const handleCompareToggle = () => {
    if (!college) return;
    
    if (isInCompare(college.id)) {
      removeFromCompare(college.id);
    } else {
      addToCompare(college);
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="trophy" size={24} color="#FF9800" />
          <Text style={styles.metricLabel}>Ranking</Text>
          <Text style={styles.metricValue}>
            {college?.ranking ? `#${college.ranking}` : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="cash" size={24} color="#4CAF50" />
          <Text style={styles.metricLabel}>Annual Fees</Text>
          <Text style={styles.metricValue}>
            {formatFees(college?.annual_fees || 0)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="trending-up" size={24} color="#2196F3" />
          <Text style={styles.metricLabel}>Avg Package</Text>
          <Text style={styles.metricValue}>
            {formatPackage(college?.average_package || 0)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Ionicons name="people" size={24} color="#9C27B0" />
          <Text style={styles.metricLabel}>Placement</Text>
          <Text style={styles.metricValue}>
            {college?.placement_percentage}%
          </Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About College</Text>
        <Text style={styles.description}>{college?.description}</Text>
      </View>

      {/* Quick Facts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Facts</Text>
        <View style={styles.factsList}>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Established:</Text>
            <Text style={styles.factValue}>{college?.established_year}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>University Type:</Text>
            <Text style={styles.factValue}>{college?.university_type}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Campus Size:</Text>
            <Text style={styles.factValue}>{college?.campus_size}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Total Students:</Text>
            <Text style={styles.factValue}>{college?.total_students?.toLocaleString()}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Faculty:</Text>
            <Text style={styles.factValue}>{college?.faculty_count}</Text>
          </View>
        </View>
      </View>

      {/* Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Courses Offered</Text>
        <View style={styles.coursesGrid}>
          {college?.courses_offered.map((course, index) => (
            <View key={index} style={styles.courseChip}>
              <Text style={styles.courseText}>{course}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCoursesFees = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Courses</Text>
        <View style={styles.coursesGrid}>
          {(college?.courses_offered || []).slice(0, 8).map((course, i) => (
            <View key={i} style={styles.courseChip}>
              <Text style={styles.courseText}>{course}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fees Overview</Text>
        {college?.course_fees?.length ? (
          <View style={styles.feeTable}>
            {college.course_fees.map((row: any, idx: number) => (
              <View key={idx} style={styles.feeRow}>
                <View>
                  <Text style={styles.feeLabel}>{row.program}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>{row.duration}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.feeValue}>{formatFees(row.fees || 0)}</Text>
                  {row.eligibility ? (
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>Elig: {row.eligibility}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.feeTable}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Annual Fees</Text>
              <Text style={styles.feeValue}>{formatFees(college?.annual_fees || 0)}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderPlacements = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Placement Stats</Text>
        <View style={styles.placementStats}>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Placement Rate</Text>
            <Text style={styles.placementValue}>{college?.placement_percentage}%</Text>
          </View>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Average Package</Text>
            <Text style={styles.placementValue}>{formatPackage(college?.average_package || 0)}</Text>
          </View>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Highest Package</Text>
            <Text style={styles.placementValue}>{formatPackage(college?.highest_package || 0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Year-wise Trends</Text>
        {college?.placement_stats?.length ? (
          <View style={styles.feeTable}>
            {college.placement_stats.map((p: any, idx: number) => (
              <View key={idx} style={styles.feeRow}>
                <Text style={styles.feeLabel}>{p.year}</Text>
                <View>
                  <Text style={styles.feeValue}>{formatPackage(p.avg_package || 0)} avg</Text>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>{p.placement_percentage || college?.placement_percentage}% placed</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.description}>Trend data not available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Recruiters</Text>
        {college?.recruiters?.length ? (
          <View style={styles.coursesGrid}>
            {college.recruiters.map((name: string, i: number) => (
              <View key={i} style={styles.courseChip}><Text style={styles.courseText}>{name}</Text></View>
            ))}
          </View>
        ) : (
          <Text style={styles.description}>Recruiter information not available</Text>
        )}
      </View>
    </View>
  );

  const renderCutoffs = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Cutoffs</Text>
          <TouchableOpacity
            onPress={() => {
              const qp = new URLSearchParams();
              qp.append('college_id', String(id));
              if (cutoffFilters.year) qp.append('year', String(cutoffFilters.year));
              if (cutoffFilters.exam) qp.append('exam', cutoffFilters.exam);
              if (cutoffFilters.category) qp.append('category', cutoffFilters.category);
              Linking.openURL(API.url(`/api/cutoffs/export?${qp.toString()}`)).catch(() => {});
            }}
            style={[styles.primaryBtn, { paddingVertical: 8, paddingHorizontal: 12 }]}
          >
            <Text style={[styles.primaryBtnText, { fontSize: 12 }]}>Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Filters UI */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Filters</Text>
          {/* Year chips */}
          <View style={styles.chipsRow}>
            {[0,1,2,3,4].map((offset) => {
              const y = new Date().getFullYear() - offset;
              const active = cutoffFilters.year === y;
              return (
                <TouchableOpacity key={y} style={[styles.chip, active && styles.chipActive]} onPress={() => setCutoffFilters(prev => ({ ...prev, year: active ? undefined : y }))}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Exam chips */}
          <View style={styles.chipsRow}>
            {(['JEE Main','KCET','MHT-CET','WBJEE','COMEDK','BITSAT'] as const).map((exam) => {
              const active = cutoffFilters.exam === exam;
              return (
                <TouchableOpacity key={exam} style={[styles.chip, active && styles.chipActive]} onPress={() => setCutoffFilters(prev => ({ ...prev, exam: active ? undefined : exam }))}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{exam}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category chips */}
          <View style={styles.chipsRow}>
            {(['OPEN','GEN','EWS','OBC','SC','ST'] as const).map((cat) => {
              const active = cutoffFilters.category === cat;
              return (
                <TouchableOpacity key={cat} style={[styles.chip, active && styles.chipActive]} onPress={() => setCutoffFilters(prev => ({ ...prev, category: active ? undefined : cat }))}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clear button when any filter active */}
          {(cutoffFilters.year || cutoffFilters.exam || cutoffFilters.category) ? (
            <TouchableOpacity onPress={() => setCutoffFilters({})} style={[styles.chip, { alignSelf: 'flex-start', backgroundColor: '#FFEFEA', borderColor: '#FFCCBC' }]}>
              <Text style={[styles.chipText, { color: '#D84315', fontWeight: '700' }]}>Clear filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {cutoffsLoading ? (
          <ActivityIndicator color="#2196F3" />
        ) : cutoffs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="filter" size={28} color="#9CA3AF" />
            <Text style={styles.emptyCardTitle}>No cutoff data</Text>
            <Text style={styles.emptyCardSub}>We’ll add cutoffs for this college soon.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.th}>Year</Text>
              <Text style={styles.th}>Round</Text>
              <Text style={styles.th}>Exam</Text>
              <Text style={styles.th}>Category</Text>
              <Text style={styles.th}>Branch</Text>
              <Text style={styles.th}>Closing</Text>
            </View>
            {cutoffs.map((c, idx) => (
              <View key={idx} style={styles.tr}>
                <Text style={styles.td}>{c.year ?? '-'}</Text>
                <Text style={styles.td}>{c.round ?? '-'}</Text>
                <Text style={styles.td}>{c.exam || '-'}</Text>
                <Text style={styles.td}>{c.category || '-'}</Text>
                <Text style={styles.td}>{c.branch || '-'}</Text>
                <Text style={styles.td}>{c.closing_rank ? `Rank ${c.closing_rank}` : (c.closing_percentile ? `${Number(c.closing_percentile).toFixed(2)}%` : '-')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seat Matrix</Text>
        {seatsLoading ? (
          <ActivityIndicator color="#2196F3" />
        ) : seats.length === 0 ? (
          <Text style={styles.description}>Seat matrix not available</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.th}>Year</Text>
              <Text style={styles.th}>Branch</Text>
              <Text style={styles.th}>Category</Text>
              <Text style={styles.th}>Intake</Text>
            </View>
            {seats.map((s, idx) => (
              <View key={idx} style={styles.tr}>
                <Text style={styles.td}>{s.year ?? '-'}</Text>
                <Text style={styles.td}>{s.branch || '-'}</Text>
                <Text style={styles.td}>{s.category || '-'}</Text>
                <Text style={styles.td}>{s.intake ?? '-'}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderReviews = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Student Reviews</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowReviewModal(true)}>
            <Text style={styles.primaryBtnText}>Write a Review</Text>
          </TouchableOpacity>
        </View>
        {reviewsLoading ? (
          <ActivityIndicator color="#2196F3" style={{ marginTop: 12 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={28} color="#9CA3AF" />
            <Text style={styles.emptyCardTitle}>No reviews yet</Text>
            <Text style={styles.emptyCardSub}>Be the first to write a review for this college.</Text>
          </View>
        ) : (
          reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewRatingBadge}>
                  <Ionicons name="star" size={12} color="#FFC107" />
                  <Text style={styles.reviewRatingText}>{Number(r.rating_overall || 0).toFixed(1)}</Text>
                </View>
                {r.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            {r.title ? <Text style={styles.reviewTitle}>{r.title}</Text> : null}
              {r.body ? <Text style={styles.reviewBody}>{r.body}</Text> : null}
              {(r.rating_academics || r.rating_placements || r.rating_infra || r.rating_faculty) ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
                  {r.rating_academics ? (<View style={styles.ratingChip}><Text style={styles.ratingChipText}>Academics: {Number(r.rating_academics).toFixed(1)}★</Text></View>) : null}
                  {r.rating_placements ? (<View style={styles.ratingChip}><Text style={styles.ratingChipText}>Placements: {Number(r.rating_placements).toFixed(1)}★</Text></View>) : null}
                  {r.rating_infra ? (<View style={styles.ratingChip}><Text style={styles.ratingChipText}>Infra: {Number(r.rating_infra).toFixed(1)}★</Text></View>) : null}
                  {r.rating_faculty ? (<View style={styles.ratingChip}><Text style={styles.ratingChipText}>Faculty: {Number(r.rating_faculty).toFixed(1)}★</Text></View>) : null}
                </View>
              ) : null}
              {(Array.isArray(r.pros) && r.pros.length) || (Array.isArray(r.cons) && r.cons.length) ? (
                <View style={{ marginTop: 8 }}>
                  {Array.isArray(r.pros) && r.pros.length ? (
                    <View style={{ marginBottom: 4 }}>
                      <Text style={{ fontSize: 12, color: '#111827', fontWeight: '700', marginBottom: 4 }}>Pros</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {r.pros.map((p: string, i: number) => (<View key={i} style={styles.bulletChip}><Text style={styles.bulletChipText}>{p}</Text></View>))}
                      </View>
                    </View>
                  ) : null}
                  {Array.isArray(r.cons) && r.cons.length ? (
                    <View>
                      <Text style={{ fontSize: 12, color: '#111827', fontWeight: '700', marginBottom: 4 }}>Cons</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {r.cons.map((c: string, i: number) => (<View key={i} style={[styles.bulletChip, { backgroundColor: '#FFF1F2', borderColor: '#FBCFE8' }]}><Text style={[styles.bulletChipText, { color: '#9D174D' }]}>{c}</Text></View>))}
                      </View>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.reviewFooter}>
                <TouchableOpacity style={styles.helpfulBtn} onPress={async () => {
                  try { await fetch(API.url(`/api/reviews/${r.id}/helpful`), { method: 'POST' }); loadReviews(); } catch {}
                }}>
                  <Ionicons name="thumbs-up-outline" size={14} color="#6B7280" />
                  <Text style={styles.helpfulText}>Helpful ({r.helpful_count || 0})</Text>
                </TouchableOpacity>
                <Text style={styles.reviewDate}>{(r.created_at || '').toString().slice(0,10)}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="fade" onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Write a Review</Text>
            <View style={styles.inputRow}> 
              <Text style={styles.inputLabel}>Overall Rating</Text>
              <TextInput
                style={styles.input}
                placeholder="0 - 5"
                keyboardType="decimal-pad"
                value={String(reviewForm.rating)}
                onChangeText={(t) => setReviewForm({ ...reviewForm, rating: parseFloat(t || '0') })}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Academics ★</Text>
              <TextInput style={styles.input} placeholder="0 - 5" keyboardType="decimal-pad" onChangeText={(t) => setReviewForm({ ...reviewForm, rating_academics: parseFloat(t || '0') as any })} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Placements ★</Text>
              <TextInput style={styles.input} placeholder="0 - 5" keyboardType="decimal-pad" onChangeText={(t) => setReviewForm({ ...reviewForm, rating_placements: parseFloat(t || '0') as any })} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Infrastructure ★</Text>
              <TextInput style={styles.input} placeholder="0 - 5" keyboardType="decimal-pad" onChangeText={(t) => setReviewForm({ ...reviewForm, rating_infra: parseFloat(t || '0') as any })} />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Faculty ★</Text>
              <TextInput style={styles.input} placeholder="0 - 5" keyboardType="decimal-pad" onChangeText={(t) => setReviewForm({ ...reviewForm, rating_faculty: parseFloat(t || '0') as any })} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Title (optional)"
              value={reviewForm.title}
              onChangeText={(t) => setReviewForm({ ...reviewForm, title: t })}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              placeholder="Share your experience..."
              value={reviewForm.body}
              onChangeText={(t) => setReviewForm({ ...reviewForm, body: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Pros (comma separated)"
              onChangeText={(t) => setReviewForm({ ...reviewForm, pros: t as any })}
            />
            <TextInput
              style={styles.input}
              placeholder="Cons (comma separated)"
              onChangeText={(t) => setReviewForm({ ...reviewForm, cons: t as any })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#E5E7EB', marginRight: 8 }]} onPress={() => setShowReviewModal(false)}>
                <Text style={[styles.primaryBtnText, { color: '#111827' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={async () => {
                try {
                  const payload: any = {
                    college_id: id,
                    user_id: 'guest',
                    title: reviewForm.title || undefined,
                    body: reviewForm.body || undefined,
                    rating_overall: Math.max(0, Math.min(5, reviewForm.rating || 0)),
                  };
                  if ((reviewForm as any).rating_academics != null) payload.rating_academics = Math.max(0, Math.min(5, Number((reviewForm as any).rating_academics)));
                  if ((reviewForm as any).rating_placements != null) payload.rating_placements = Math.max(0, Math.min(5, Number((reviewForm as any).rating_placements)));
                  if ((reviewForm as any).rating_infra != null) payload.rating_infra = Math.max(0, Math.min(5, Number((reviewForm as any).rating_infra)));
                  if ((reviewForm as any).rating_faculty != null) payload.rating_faculty = Math.max(0, Math.min(5, Number((reviewForm as any).rating_faculty)));
                  if ((reviewForm as any).pros) payload.pros = String((reviewForm as any).pros).split(',').map(s => s.trim()).filter(Boolean);
                  if ((reviewForm as any).cons) payload.cons = String((reviewForm as any).cons).split(',').map(s => s.trim()).filter(Boolean);
                  const res = await fetch(API.url('/api/reviews'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
                  if (res.ok) { setShowReviewModal(false); setReviewForm({ title: '', body: '', rating: 4.5 }); loadReviews(); }
                } catch {}
              }}>
                <Text style={styles.primaryBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderGallery = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
          {college?.gallery_urls?.length ? (
            college.gallery_urls.map((url, idx) => (
              <Image key={idx} source={{ uri: url }} style={styles.galleryImage} />
            ))
          ) : college?.images_base64?.length ? (
            college.images_base64.map((img, idx) => (<Image key={idx} source={{ uri: `data:image/jpeg;base64,${img}` }} style={styles.galleryImage} />))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="images-outline" size={28} color="#9CA3AF" />
              <Text style={styles.emptyCardTitle}>No images available</Text>
              <Text style={styles.emptyCardSub}>We’ll add campus photos soon.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );

  // Quick action handlers
  const handleCall = () => {
    if (!college?.contact_phone) return;
    const telUrl = `tel:${college.contact_phone}`;
    Linking.openURL(telUrl).catch(() => {});
  };

  const handleWebsite = () => {
    if (!college?.website) return;
    let url = college.website.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  const handleMap = () => {
    if (!college?.address) return;
    const query = encodeURIComponent(college.address);
    const ios = `maps://?q=${query}`;
    const android = `geo:0,0?q=${query}`;
    const web = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const url = Platform.select({ ios, android, default: web }) as string;
    Linking.openURL(url).catch(() => {});
  };

  const renderFacilities = () => (
    <View style={styles.tabContent}>
      <View style={styles.facilitiesGrid}>
        <FacilityItem 
          icon="bed" 
          title="Hostel" 
          available={college?.hostel_facilities} 
        />
        <FacilityItem 
          icon="wifi" 
          title="WiFi" 
          available={college?.wifi} 
        />
        <FacilityItem 
          icon="library" 
          title="Library" 
          available={college?.library_facilities} 
        />
        <FacilityItem 
          icon="basketball" 
          title="Sports" 
          available={college?.sports_facilities} 
        />
        <FacilityItem 
          icon="restaurant" 
          title="Canteen" 
          available={college?.canteen} 
        />
        <FacilityItem 
          icon="medical" 
          title="Medical" 
          available={college?.medical_facilities} 
        />
      </View>
    </View>
  );

  const renderAdmissions = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admission Process</Text>
        <Text style={styles.description}>{college?.admission_process}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Placement Statistics</Text>
        <View style={styles.placementStats}>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Placement Rate</Text>
            <Text style={styles.placementValue}>{college?.placement_percentage}%</Text>
          </View>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Average Package</Text>
            <Text style={styles.placementValue}>{formatPackage(college?.average_package || 0)}</Text>
          </View>
          <View style={styles.placementItem}>
            <Text style={styles.placementLabel}>Highest Package</Text>
            <Text style={styles.placementValue}>{formatPackage(college?.highest_package || 0)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accreditation</Text>
        <View style={styles.accreditationList}>
          {college?.accreditation?.map((acc, index) => (
            <View key={index} style={styles.accreditationChip}>
              <Text style={styles.accreditationText}>{acc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContact = () => (
    <View style={styles.tabContent}>
      <View style={styles.contactCard}>
        <Ionicons name="location" size={24} color="#2196F3" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Address</Text>
          <Text style={styles.contactValue}>{college?.address}</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="mail" size={24} color="#4CAF50" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>{college?.contact_email}</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="call" size={24} color="#FF9800" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Phone</Text>
          <Text style={styles.contactValue}>{college?.contact_phone}</Text>
        </View>
      </View>

      <View style={styles.contactCard}>
        <Ionicons name="globe" size={24} color="#9C27B0" />
        <View style={styles.contactInfo}>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>{college?.website}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, !college?.contact_phone && styles.quickActionDisabled]}
          onPress={handleCall}
          disabled={!college?.contact_phone}
        >
          <Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.quickActionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, !college?.website && styles.quickActionDisabled]}
          onPress={handleWebsite}
          disabled={!college?.website}
        >
          <Ionicons name="globe" size={18} color="#fff" />
          <Text style={styles.quickActionText}>Website</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, !college?.address && styles.quickActionDisabled]}
          onPress={handleMap}
          disabled={!college?.address}
        >
          <Ionicons name="map" size={18} color="#fff" />
          <Text style={styles.quickActionText}>Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FacilityItem = ({ icon, title, available }: { 
    icon: string; 
    title: string; 
    available?: boolean; 
  }) => (
    <View style={[styles.facilityCard, available ? styles.facilityAvailable : styles.facilityUnavailable]}>
      <Ionicons 
        name={icon as any} 
        size={24} 
        color={available ? "#4CAF50" : "#ccc"} 
      />
      <Text style={[styles.facilityTitle, { color: available ? "#333" : "#999" }]}>
        {title}
      </Text>
      <Text style={[styles.facilityStatus, { color: available ? "#4CAF50" : "#999" }]}>
        {available ? "Available" : "Not Available"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading college details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!college) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF5722" />
          <Text style={styles.errorTitle}>College Not Found</Text>
          <Text style={styles.errorText}>
            The college you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'information-circle' },
    { id: 'courses', title: 'Courses & Fees', icon: 'book' },
    { id: 'cutoffs', title: 'Cutoffs', icon: 'filter' },
    { id: 'placements', title: 'Placements', icon: 'trending-up' },
    { id: 'facilities', title: 'Facilities', icon: 'business' },
    { id: 'admissions', title: 'Admissions', icon: 'school' },
    { id: 'reviews', title: 'Reviews', icon: 'chatbubbles' },
    { id: 'gallery', title: 'Gallery', icon: 'images' },
    { id: 'contact', title: 'Contact', icon: 'call' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>College Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFavoriteToggle} style={styles.headerButton}>
            <Ionicons 
              name={isFavorite(college.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite(college.id) ? "#FF5722" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
      >
        {/* College Header */}
        <Animatable.View animation="fadeInUp" style={styles.collegeHeader}>
          <View style={styles.collegeHeaderContent}>
            {college.logo_base64 ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${college.logo_base64}` }}
                style={styles.collegeLogo}
              />
            ) : (
              <View style={[styles.collegeLogo, styles.placeholderLogo]}>
                <Ionicons name="school" size={32} color="#2196F3" />
              </View>
            )}
            
            <View style={styles.collegeInfo}>
              <Text style={styles.collegeName}>{college.name}</Text>
              <Text style={styles.collegeLocation}>
                {college.city}, {college.state}
              </Text>
              <View style={styles.ratingRow}>
                {renderStars(college.star_rating)}
                <Text style={styles.ratingText}>({college.star_rating})</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons 
                    name={tab.icon as any} 
                    size={16} 
                    color={activeTab === tab.id ? "#2196F3" : "#666"} 
                  />
                  <Text style={[
                    styles.tabText, 
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        <Animatable.View 
          key={activeTab} 
          animation="fadeInUp" 
          duration={300}
          style={styles.tabContentContainer}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'courses' && renderCoursesFees()}
          {activeTab === 'placements' && renderPlacements()}
          {activeTab === 'cutoffs' && renderCutoffs()}
          {activeTab === 'facilities' && renderFacilities()}
          {activeTab === 'admissions' && renderAdmissions()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'contact' && renderContact()}
        </Animatable.View>
      </ScrollView>

      {/* Footer Actions */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(12, insets.bottom + 12),
            paddingLeft: 16 + (insets.left || 0),
            paddingRight: 16 + (insets.right || 0),
          },
        ]}
      >
        <TouchableOpacity 
          style={[styles.compareButton, isInCompare(college.id) && styles.compareButtonActive]}
          onPress={handleCompareToggle}
        >
          <Ionicons 
            name="analytics" 
            size={18} 
            color={isInCompare(college.id) ? "#fff" : "#2196F3"} 
          />
          <Text style={[
            styles.compareButtonText, 
            isInCompare(college.id) && styles.compareButtonTextActive
          ]}>
            {isInCompare(college.id) ? 'Added to Compare' : 'Add to Compare'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.applyButton} onPress={() => setShowLeadModal(true)}>
          <Text style={styles.applyButtonText}>Apply / Enquire</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Lead / Enquiry Modal */}
      <Modal visible={showLeadModal} transparent animationType="fade" onRequestClose={() => setShowLeadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Apply / Enquire</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={leadForm.name}
              onChangeText={(t) => setLeadForm({ ...leadForm, name: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={leadForm.email}
              onChangeText={(t) => setLeadForm({ ...leadForm, email: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={leadForm.phone}
              onChangeText={(t) => setLeadForm({ ...leadForm, phone: t })}
            />
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Message (optional)"
              multiline
              value={leadForm.message}
              onChangeText={(t) => setLeadForm({ ...leadForm, message: t })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#E5E7EB', marginRight: 8 }]} onPress={() => setShowLeadModal(false)}>
                <Text style={[styles.primaryBtnText, { color: '#111827' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={async () => {
                try {
                  const payload = {
                    college_id: id,
                    name: leadForm.name.trim(),
                    email: leadForm.email.trim() || undefined,
                    phone: leadForm.phone.trim() || undefined,
                    message: leadForm.message.trim() || undefined,
                    user_id: 'guest',
                    source: 'app'
                  };
                  if (!payload.name) return;
                  const res = await fetch(API.url('/api/leads'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
                  if (res.ok) { setShowLeadModal(false); setLeadForm({ name: '', email: '', phone: '', message: '' }); }
                } catch {}
              }}>
                <Text style={styles.primaryBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  collegeHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  collegeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collegeLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  placeholderLogo: {
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeInfo: {
    flex: 1,
  },
  collegeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  collegeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  tabNavigation: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 16,
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  factsList: {
    marginTop: 8,
  },
  factItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  factLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  factValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  courseChip: {
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  courseText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 16,
    borderWidth: 1,
  },
  facilityAvailable: {
    borderColor: '#4CAF50',
  },
  facilityUnavailable: {
    borderColor: '#E0E0E0',
  },
  facilityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  facilityStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  placementStats: {
    marginTop: 8,
  },
  placementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  placementLabel: {
    fontSize: 14,
    color: '#666',
  },
  placementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginTop: 12,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewRatingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7E6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  reviewRatingText: { fontWeight: '700', color: '#9C6B00', marginLeft: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { color: '#10B981', fontWeight: '600', marginLeft: 4 },
  reviewTitle: { marginTop: 8, fontWeight: '700', color: '#111827' },
  reviewBody: { marginTop: 4, color: '#374151' },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  helpfulBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpfulText: { color: '#6B7280', marginLeft: 6 },
  reviewDate: { color: '#9CA3AF', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  inputRow: { marginTop: 4 },
  inputLabel: { color: '#6B7280', fontSize: 12 },
  accreditationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  accreditationChip: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  accreditationText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Courses & Fees
  feeTable: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  feeLabel: { color: '#666', fontSize: 14 },
  feeValue: { color: '#111827', fontSize: 14, fontWeight: '600' },
  // Gallery & Empty states
  galleryRow: { paddingVertical: 8 },
  galleryImage: { width: 220, height: 140, borderRadius: 12, marginRight: 12, backgroundColor: '#f0f0f0' },
  // Cutoffs
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', paddingHorizontal: 12, paddingVertical: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  th: { flex: 1, fontSize: 12, fontWeight: '700', color: '#374151' },
  table: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  tr: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  td: { flex: 1, fontSize: 12, color: '#374151' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // simple chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#2196F3', borderColor: '#1E88E5' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
  },
  emptyCardTitle: { marginTop: 8, fontWeight: '700', color: '#111827' },
  emptyCardSub: { color: '#6B7280', marginTop: 4, textAlign: 'center' },
  primaryBtn: { marginTop: 12, backgroundColor: '#2196F3', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  ratingChip: { backgroundColor: '#E8F5E9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginTop: 6 },
  ratingChipText: { color: '#1B5E20', fontSize: 11, fontWeight: '700' },
  bulletChip: { backgroundColor: '#E6F0FF', borderWidth: 1, borderColor: '#C5D6FD', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  bulletChipText: { color: '#0B4DB6', fontSize: 11, fontWeight: '600' },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  compareButton: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    gap: 8,
    minWidth: 160,
  },
  compareButtonActive: {
    backgroundColor: '#2196F3',
  },
  compareButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 8,
  },
  compareButtonTextActive: {
    color: '#fff',
  },
  applyButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 130,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  quickActionDisabled: {
    backgroundColor: '#B0BEC5',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
