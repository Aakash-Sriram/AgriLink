interface EnvVariables {
  REACT_APP_API_URL: string;
  REACT_APP_GOOGLE_MAPS_KEY: string;
  REACT_APP_FIREBASE_CONFIG: string;
}

export const validateEnv = (): EnvVariables => {
  const requiredVars = [
    'REACT_APP_API_URL',
    'REACT_APP_GOOGLE_MAPS_KEY',
    'REACT_APP_FIREBASE_CONFIG'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL!,
    REACT_APP_GOOGLE_MAPS_KEY: process.env.REACT_APP_GOOGLE_MAPS_KEY!,
    REACT_APP_FIREBASE_CONFIG: process.env.REACT_APP_FIREBASE_CONFIG!
  };
}; 