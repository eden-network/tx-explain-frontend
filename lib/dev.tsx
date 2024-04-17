const isDevEnvironment = process.env.NEXT_PUBLIC_ENV === 'test' || process.env.NEXT_PUBLIC_ENV === 'local';

export { isDevEnvironment }