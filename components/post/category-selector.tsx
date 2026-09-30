import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { fontFamily } from '@/constants/typography';

const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Clothing & Shoes',
  'Books & Media',
  'Home & Kitchen',
  'Plants & Garden',
  'Toys & Games',
  'Other (Custom)'
];

const CATEGORY_ICONS: Record<string, string> = {
  'Furniture': 'bed-outline',
  'Electronics': 'phone-portrait-outline',
  'Clothing & Shoes': 'shirt-outline',
  'Books & Media': 'book-outline',
  'Home & Kitchen': 'restaurant-outline',
  'Plants & Garden': 'leaf-outline',
  'Toys & Games': 'game-controller-outline',
  'Other (Custom)': 'grid-outline',
};

const isStandardCategory = (cat: string) => {
  return [
    'Furniture',
    'Electronics',
    'Clothing & Shoes',
    'Books & Media',
    'Home & Kitchen',
    'Plants & Garden',
    'Toys & Games'
  ].includes(cat);
};

interface CategorySelectorProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (category: string) => {
    if (category === 'Other (Custom)') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      onSelect(category);
      setModalVisible(false);
    }
  };

  const submitCustom = () => {
    if (customCategory.trim()) {
      onSelect(customCategory.trim());
    }
    setModalVisible(false);
    setShowCustomInput(false);
    setCustomCategory('');
  };

  const close = () => {
    setModalVisible(false);
    setShowCustomInput(false);
    setCustomCategory('');
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Category<Text style={styles.requiredAsterisk}> *</Text></Text>
        <Pressable style={[styles.selector, !!selected && styles.selectorFilled]} onPress={() => setModalVisible(true)}>
          <View style={styles.selectorLeft}>
            <Ionicons 
              name={selected ? (CATEGORY_ICONS[selected] || 'cube-outline') as any : 'list-outline'} 
              size={20} 
              color={selected ? colors.primary : colors.onSurfaceVariant} 
            />
            <Text style={[
              styles.selectorText, 
              !selected && styles.placeholderText,
              !!selected && styles.selectorTextFilled
            ]}>
              {selected ? selected : 'Select a category'}
            </Text>
          </View>
          <Ionicons name={selected ? 'checkmark-circle' : 'chevron-down'} size={20} color={selected ? colors.primary : colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={close}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable onPress={close} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </Pressable>
            </View>

            {!showCustomInput ? (
              <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = item === 'Other (Custom)'
                    ? (!!selected && !isStandardCategory(selected))
                    : selected === item;
                  return (
                    <Pressable 
                      style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                      onPress={() => handleSelect(item)}
                    >
                      <View style={styles.categoryLeft}>
                        <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                          <Ionicons 
                            name={(CATEGORY_ICONS[item] ?? 'cube-outline') as any} 
                            size={18} 
                            color={isSelected ? '#ffffff' : colors.onSurfaceVariant} 
                          />
                        </View>
                        <Text style={[
                          styles.categoryText,
                          isSelected && styles.categoryTextSelected
                        ]}>
                          {item}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      )}
                    </Pressable>
                  );
                }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.customInputContainer}>
                <Text style={styles.customInputLabel}>Type your custom category</Text>
                <TextInput
                  style={styles.customInput}
                  placeholder="e.g. Vintage Clocks"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  autoFocus
                />
                <Pressable 
                  style={[styles.saveButton, !customCategory.trim() && styles.saveButtonDisabled]}
                  onPress={submitCustom}
                  disabled={!customCategory.trim()}
                >
                  <Text style={styles.saveButtonText}>Save Category</Text>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontFamily: fontFamily.label,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: colors.error,
    fontWeight: 'bold',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectorText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  selectorFilled: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  selectorTextFilled: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: colors.onSurfaceVariant,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  closeButton: {
    padding: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  categoryItemSelected: {
    backgroundColor: colors.surfaceContainerLow,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
  },
  categoryTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  customInputContainer: {
    marginTop: 16,
  },
  customInputLabel: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  saveButtonText: {
    fontFamily: fontFamily.label,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
