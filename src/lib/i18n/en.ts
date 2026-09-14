/**
 * English message catalogue. This is the source of truth for the SHAPE of the
 * messages: every other locale is typed against it, so a missing or misspelled
 * key is a build error rather than a string that silently renders in English.
 *
 * Deliberately NOT `as const`. Widening the values to `string` is what lets
 * another locale supply different text for the same key while still being
 * checked for completeness.
 *
 * Messages needing a value are functions, so their arguments are type-checked
 * at the call site too.
 */
export const en = {
  common: {
    skipToContent: 'Skip to content',
    or: 'or',
    planned: 'Planned',
    getStarted: 'Get started',
  },

  nav: {
    identify: 'What it identifies',
    goal: 'Our goal',
    connect: 'Connections',
    primaryLabel: 'Primary',
    footerLabel: 'Footer',
  },

  hero: {
    eyebrow: 'Field catalogue',
    title: 'Know what’s growing around you.',
    lede: 'Photograph anything that grows. Marka tells you what it is, then keeps the find in one catalogue that belongs to you.',
    primaryCta: 'Start your catalogue',
    secondaryCta: 'See what it identifies',
    subjectsLabel: 'What Marka identifies',
  },

  identify: {
    eyebrow: 'What it identifies',
    title: 'Point it at anything that grows.',
    intro:
      'Flowers, fungi, trees: the same photograph, the same catalogue. What changes is how much certainty Marka can honestly give you, and it says so every time.',
  },

  subjects: {
    flowers: {
      label: 'Flowers',
      headline: 'Wildflowers and garden blooms',
      text: 'Ranked matches with the traits behind each one: petal count, leaf arrangement, and where you were standing when you took the photo.',
      caveat: 'Every match carries its confidence. Never a single silent guess.',
    },
    fungi: {
      label: 'Fungi',
      headline: 'Mushrooms and bracket fungi',
      text: 'Identified like everything else, and told plainly when a match is not strong enough to rely on. With fungi, that is often the honest answer.',
      caveat:
        'Never forage on an identification alone. Marka is a catalogue, not an authority on what is safe to eat.',
    },
    trees: {
      label: 'Trees',
      headline: 'Trees, shrubs and their fruit',
      text: 'Checked against conservation status as you record them, so you find out when something growing near you is threatened.',
      caveat: 'Conservation status sourced from the IUCN Red List.',
    },
  },

  goal: {
    eyebrow: 'Our goal',
    title: 'A record of what grows here, before it doesn’t.',
    body1:
      'Most plant records are still locked in notebooks and camera rolls. Marka exists to turn the ones you make into something legible: dated, located, named, and yours to export.',
    body2:
      'Cataloguing for yourself is the whole point. That the result also happens to be the kind of record conservation work depends on is the reason we built it this way.',
  },

  connect: {
    eyebrow: 'Connections',
    title: 'Built to plug into the records that already exist.',
    text: 'There is a working open infrastructure for biodiversity data, and Marka has no interest in replacing it. These are the services we intend to connect to, so your catalogue is never trapped in one app.',
    inaturalist: 'Push an observation you are happy with to the community that will verify it.',
    gbif: 'The global occurrence record researchers actually query. Your finds can land there.',
    iucn: 'The conservation status behind every threatened-species flag Marka raises.',
    plantnet: 'A second opinion on an identification when the first one is not convincing.',
  },

  closing: {
    title: 'Start with the one outside your window.',
    text: 'A catalogue does not need to begin with a field trip. Photograph whatever is nearest and see what Marka makes of it.',
    primaryCta: 'Start your catalogue',
    secondaryCta: 'See how it works',
  },

  footer: {
    tagline: 'A catalogue of what grows around you.',
  },

  auth: {
    quote: 'Every plant you record is one more thing known about where you live.',
    quoteMeta: 'Flowers, fungi and trees',

    signInTitle: 'Welcome back',
    signInSubtitle: 'Sign in to pick up your catalogue where you left it.',
    signInSubmit: 'Sign in',
    newHere: 'New here?',
    createAccount: 'Create an account',

    signUpTitle: 'Start your catalogue',
    signUpSubtitle: 'One account, every plant you record. Free while Marka is in the making.',
    signUpSubmit: 'Create account',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',

    resetTitle: 'Choose a new password',

    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordHint:
      'At least 8 characters, with an uppercase letter, a lowercase letter and a number.',
    forgotPassword: 'Forgot your password?',
    forgotTitle: 'Reset your password',
    forgotSubtitle: 'Enter the address you signed up with and we will email you a code.',
    forgotSubmit: 'Send code',
    newPasswordLabel: 'New password',
    resetSubmit: 'Set new password',
    resetDone: 'Password updated. Sign in with your new password.',
    rememberedIt: 'Remembered it?',
    useDifferentEmail: 'Use a different address',
    verifiedNotice: 'Email verified. Sign in to continue.',
    submitting: 'Just a moment…',
    continueWithGoogle: 'Continue with Google',
    emailTaken: 'That address already has an account. Sign in instead.',
    notConfirmed: 'This account still needs verifying. We have sent a new code.',
    networkError: 'We could not reach the server. Check your connection and try again.',
    googleUnavailable: 'Google sign-in is not configured in this build.',
    googleFailed: 'Google sign-in did not complete. Please try again.',
    completingSignIn: 'Completing sign-in\u2026',
    genericError: 'Something went wrong. Please try again.',
  },

  verify: {
    title: 'Check your inbox',
    sentToLead: 'We sent a six-digit code to',
    expiry: 'The code expires in 15 minutes.',
    codeLabel: 'Verification code',
    submit: 'Verify email',
    submitting: 'Checking\u2026',
    resend: 'Send a new code',
    resendIn: (seconds: number) => `You can ask for a new code in ${seconds}s`,
    resent: 'A new code is on its way.',
    spamHint: 'Nothing yet? It may be in your spam folder.',
    wrongAddress: 'Wrong address?',
    startOver: 'Start over',
    noPendingTitle: 'Nothing to verify',
    noPendingSubtitle:
      'We have no pending sign-up on this device. Create an account and we will send you a code.',
    codeIncorrect: 'That code is not right. Check it and try again.',
    codeExpired: 'That code has expired. Ask for a new one.',
  },

  app: {
    title: 'Your catalogue',
    subtitle: 'You are signed in. Your plant records will appear here.',
    signOut: 'Sign out',
    openCatalogue: 'Open catalogue',
    checking: 'Checking your session\u2026',
    connectionOk: 'Connected to the Marka API.',
    connectionFailed: 'Could not reach the Marka API.',
  },

  validation: {
    emailRequired: 'Enter your email address.',
    emailInvalid: 'That does not look like an email address. Check for a typo.',
    passwordRequired: 'Enter your password.',
    passwordTooShort: 'Use at least 8 characters.',
    passwordNeedsLower: 'Add a lowercase letter.',
    passwordNeedsUpper: 'Add an uppercase letter.',
    passwordNeedsDigit: 'Add a number.',
    codeRequired: 'Enter the six-digit code.',
    codeInvalid: 'The code is six digits.',
  },

  a11y: {
    languageGroup: 'Language',
    codeProgress: (filled: number, total: number) => `${filled} of ${total} digits entered`,
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    switchToDark: 'Switch to dark theme',
    switchToLight: 'Switch to light theme',
    switchToPortuguese: 'Mudar para português',
    switchToEnglish: 'Switch to English',
  },
};

/** The contract every other locale must satisfy. */
export type Messages = typeof en;
