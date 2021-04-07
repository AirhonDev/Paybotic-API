import * as moduleAliases from 'module-alias'
import * as path from 'path'

export default (): void => {
  moduleAliases.addAliases({
    "@components": path.join(__dirname, 'api/components/'),
    "@logger": path.join(__dirname, 'utilities/LoggerUtil.js'),
    "@middlewares": path.join(__dirname, 'api/middlewares/'),
    "@services": path.join(__dirname, 'services/'),
    "@models": path.join(__dirname, 'models/'),
    '@baserepository': path.join(__dirname, 'services/BaseRepository.js'),
    '@utilities': path.join(__dirname, 'utilities/'),
    "@responses": path.join(__dirname, 'api/responses/index.js'),
  });
  console.log("Successfully setup module aliases.");
}