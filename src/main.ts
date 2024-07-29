import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createYoga, YogaInitialContext } from 'graphql-yoga';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Request } from 'express';

// Context 타입 정의
interface Context extends YogaInitialContext {
  req: Request;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const graphqlSchemaHost = app.get(GraphQLSchemaHost);
  const { schema } = graphqlSchemaHost;

  // GraphQL Yoga 설정
  const yoga = createYoga<Context>({
    schema,
    context: ({ req }) => ({ req }),
  });

  app.use('/graphql', yoga);

  await app.listen(3000);
}

bootstrap();
