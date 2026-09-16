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
    loading: 'Loading\u2026',
    close: 'Close',
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
    idleNotice: 'You were signed out after 30 minutes without activity.',
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
    emailTaken: 'That address already has an account.',
    notConfirmed: 'This account still needs verifying. We have sent a new code.',
    networkError: 'We could not reach the server. Check your connection and try again.',
    googleUnavailable: 'Google sign-in is not configured in this build.',
    googleFailed: 'Google sign-in did not complete. Please try again.',
    completingSignIn: 'Completing sign-in\u2026',
    genericError: 'Something went wrong. Please try again.',
    invalidCredentials: 'Wrong email or password.',
    cannotReset: 'This account has not been verified yet, so its password cannot be reset.',
    verifyEmailFirst: 'Verify your email',
    tooManyRequests: 'Too many attempts. Wait a moment and try again.',
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
    signOut: 'Sign out',
    openCatalogue: 'Open catalogue',
  },

  plants: {
    title: 'Your catalogue',
    subtitle: 'Add a photo of a plant and Marka will tell you what it is.',
    dropTitle: 'Drop a plant photo here',
    dropTitleTouch: 'Take or choose a photo',
    dropHint: 'or click to choose one. JPEG or PNG.',
    dropHintTouch: 'JPEG or PNG. Close-ups of leaves or flowers work best.',
    dropActive: 'Release to identify',
    wrongType: 'That file is not a JPEG or PNG photo.',
    yourPhoto: 'Your photo',
    stagePreparing: 'Preparing your photo\u2026',
    stageUploading: 'Uploading\u2026',
    stageIdentifying: 'Identifying\u2026 this can take up to 15 seconds.',
    resultsTitle: 'Possible matches',
    lowCertainty:
      'Marka is not sure about this one. Compare the matches with your plant before choosing.',
    highCertainty: 'This looks like a confident match.',
    confidence: (percent: number) => `${percent}% match`,
    photoCredit: (author: string) => `Photo: ${author}`,
    quota: (remaining: number, limit: number) =>
      `${remaining} of ${limit} identifications left today`,
    choose: 'This is it',
    confirming: 'Saving\u2026',
    confirmedTitle: 'Added to your catalogue',
    alreadyConfirmed: 'This plant is already in your catalogue.',
    description: 'About',
    care: 'Care',
    toxicity: 'Toxicity',
    nativeStatus: 'Native status',
    identifyAnother: 'Identify another plant',
    tryAgain: 'Try again',
    noMatchTitle: 'Couldn\u2019t find a plant in that photo',
    noMatchHint: 'Try a closer photo of the leaves or a flower.',
    dailyLimitTitle: 'You have reached today\u2019s identification limit',
    dailyLimitAt: (time: string) => `You can identify more plants after ${time}.`,
    dailyLimitTomorrow: 'You can identify more plants tomorrow.',
    invalidImage: 'Use a JPEG or PNG photo.',
    imageTooLarge: 'That photo is too large to upload. Try a smaller one.',
    unreadablePhoto: 'Marka couldn\u2019t read that photo. Try a JPEG or PNG.',
    uploadExpired: 'The upload took too long. Try again.',
    providerDown: 'Identification is unavailable right now. Try again in a moment.',
    enrichmentRefused: 'Care details aren\u2019t available for this species.',
    catalogueTitle: 'Identified plants',
    emptyTitle: 'No plants yet',
    emptyHint: 'Your identified plants will appear here.',
    notConfirmed: 'Not confirmed',
    loadMore: 'Load more',
    loadingMore: 'Loading\u2026',
    listFailed: 'Your catalogue could not be loaded.',
    unnamed: 'Unknown plant',
    seenOn: (date: string) => `Seen ${date}`,
    editPlant: (name: string) => `Edit ${name}`,
    deletePlant: (name: string) => `Delete ${name}`,
    openPlant: (name: string) => `Open ${name}`,
    otherMatches: 'Other matches',
    noDetails: 'No care details for this plant yet.',
    editTitle: 'Edit plant',
    notes: 'Notes',
    notesPlaceholder: 'Where you saw it, how it was doing\u2026',
    notesCount: (count: number, max: number) => `${count} / ${max}`,
    notesTooLong: (max: number) => `Keep notes under ${max} characters.`,
    observedAt: 'When you saw it',
    observedAtFuture: 'That date is in the future.',
    optional: 'Optional',
    location: 'Location',
    noLocation: 'No location',
    useCurrentLocation: 'Use my current location',
    locating: 'Finding you\u2026',
    removeLocation: 'Remove location',
    locationDenied: 'Location access is turned off for this site.',
    locationFailed: 'Your location could not be found.',
    save: 'Save changes',
    saving: 'Saving\u2026',
    cancel: 'Cancel',
    deleteTitle: 'Delete this plant?',
    deleteBody: (name: string) => `${name} and its photo will be removed for good.`,
    deleteCredit: 'It still counts towards today\u2019s identification limit.',
    deleteConfirm: 'Delete',
    deleting: 'Deleting\u2026',
    alreadyDeleted: 'This plant was already deleted.',
  },

  idle: {
    title: 'Still there?',
    body: (seconds: number) => `For your security, you will be signed out in ${seconds} seconds.`,
    stay: 'Stay signed in',
    signOut: 'Sign out now',
  },

  validation: {
    emailRequired: 'Enter your email address.',
    emailInvalid: 'That does not look like an email address. Check for a typo.',
    passwordRequired: 'Enter your password.',
    passwordTooShort: 'Use at least 8 characters.',
    passwordNeedsLower: 'Add a lowercase letter.',
    passwordNeedsUpper: 'Add an uppercase letter.',
    passwordNeedsDigit: 'Add a number.',
    passwordRejected:
      'That password does not meet the rules: at least 8 characters, with an uppercase letter, a lowercase letter and a number.',
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
