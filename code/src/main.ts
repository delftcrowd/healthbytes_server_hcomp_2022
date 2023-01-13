import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(process.env.PORT || 3333)
}
bootstrap()
