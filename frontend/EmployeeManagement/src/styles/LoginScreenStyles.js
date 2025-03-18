import {StyleSheet} from 'react-native';
import COLORS from '../theme/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImageContainer: {
    marginBottom: 15,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  companyName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 161, 154, 0.3)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.secondary,
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputField: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputText: {
    color: COLORS.text,
    fontSize: 16,
    paddingLeft: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
  loginButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    color: COLORS.textLight,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
});

export default styles;
