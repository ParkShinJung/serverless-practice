const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { execSync } = require('child_process');

// packages 디렉토리 경로 설정
const packagesPath = path.join(__dirname, '../../packages'); // 프로젝트 루트 아래의 'packages' 디렉토리

// packages 디렉토리 내 모든 서비스(디렉토리) 목록 가져오기
const packageDirs = fs.readdirSync(packagesPath).filter(item => fs.statSync(path.join(packagesPath, item)).isDirectory());

// 빌드를 진행할 서비스의 src 디렉토리들만 찾기
const getServiceSrcDirs = (serviceName) => {
  const srcDir = path.join(packagesPath, serviceName, 'src');
  if (fs.existsSync(srcDir)) {
    return fs.readdirSync(srcDir).filter(item => fs.statSync(path.join(srcDir, item)).isDirectory());
  }
  return [];
};

// 각 서비스별로 빌드를 처리하는 함수
const buildFunction = async (serviceName, funcPath) => {
  console.log(`Building ${serviceName}/${funcPath}...`);

  const funcHandlerPath = path.join(funcPath, 'handler.ts'); // 각 함수의 handler.ts 파일 경로
  const outDir = path.join(packagesPath, serviceName, 'dist'); // dist 폴더는 각 서비스 디렉토리 내에 생성

  // dist 폴더가 없다면 생성
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    // esbuild를 사용해 TS 파일을 번들링
    await esbuild.build({
      entryPoints: [funcHandlerPath],
      bundle: true,
      minify: false,
      platform: 'node',
      target: 'node20', // Node.js 20 버전 타겟
      outfile: path.join(outDir, 'handler.js'),
      external: ['aws-sdk'], // AWS SDK는 외부 종속성으로 처리
    });
    console.log(`Build succeeded for ${serviceName}/${funcPath}`);
  } catch (err) {
    console.error(`Build failed for ${serviceName}/${funcPath}:`, err);
    process.exit(1);
  }
};

// 전체 서비스에 대해 빌드를 실행하는 함수
const buildAllFunctions = async () => {
  const buildPromises = [];

  // packages 하위의 모든 서비스 디렉토리 순회
  packageDirs.forEach(serviceName => {
    const serviceSrcDirs = getServiceSrcDirs(serviceName);

    serviceSrcDirs.forEach(funcDir => {
      buildPromises.push(buildFunction(serviceName, path.join(packagesPath, serviceName, 'src', funcDir)));
    });
  });

  await Promise.all(buildPromises);
  console.log('Build completed successfully');
};

// 빌드 실행
buildAllFunctions().catch(err => {
  console.error('An error occurred during the build process:', err);
  process.exit(1);
});
