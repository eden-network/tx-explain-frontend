const isProdEnvironment = process.env.NEXT_PUBLIC_ENV === 'prod'
const isStagingEnvironment = process.env.NEXT_PUBLIC_ENV === 'staging'
const isDevEnvironment = process.env.NEXT_PUBLIC_ENV === 'test' || process.env.NEXT_PUBLIC_ENV === 'dev'
const isLocalEnvironment = process.env.NEXT_PUBLIC_ENV === 'local';

export { isProdEnvironment, isStagingEnvironment, isDevEnvironment, isLocalEnvironment }