import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { H1 } from './Typography';

interface AppHeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, rightComponent }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.content}>
        <H1 style={styles.title}>{title}</H1>
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    minHeight: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  rightComponent: {
    marginLeft: 16,
  },
});

export default AppHeader;
