## Description

This repo contains code of rocco-chat-server. This is a homeserver and can be hosted locally. 

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

```
project-root/
  ├── src/
  │    ├── main.ts                # Entry point of the application
  │    ├── app.module.ts          # Root module of the application
  │    ├── prisma/                # Prisma-related files
  │    │     ├── schema.prisma    # Prisma schema definition
  │    │     ├── client.ts        # Prisma client setup
  │    │     ├── migrations/      # Prisma migrations folder
  │    │
  │    ├── modules/
  │    │     ├── auth/            # Example module (e.g., authentication)
  │    │     │     ├── auth.controller.ts
  │    │     │     ├── auth.service.ts
  │    │     │     ├── auth.module.ts
  │    │
  │    ├── common/
  │    │     ├── exceptions/      # Custom exception filters
  │    │     ├── interceptors/    # Custom interceptors
  │    │     ├── decorators/      # Custom decorators
  │    │
  │    ├── config/                # Configuration files (e.g., environment variables)
  │    ├── dto/                   # Data transfer objects
  │    ├── entities/              # Prisma entity models
  │
  ├── test/                        # Unit and integration tests
  │
  ├── .env                         # Environment-specific configuration
  ├── .gitignore
  ├── package.json
  ├── tsconfig.json
  ├── README.md
```