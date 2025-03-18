import {StyleSheet} from 'react-native';
import COLORS from '../theme/colors';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: COLORS.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 161, 154, 0.3)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 5,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingHorizontal: 5,
  },
  inputText: {
    color: COLORS.text,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  buttonPrimary: {
    width: '48%',
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonSecondary: {
    width: '48%',
    borderRadius: 10,
  },
  errorContainer: {
    marginHorizontal: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
});

export default styles;
