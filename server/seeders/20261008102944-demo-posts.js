'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert("Posts", [{
      title: "Optimizing Next.js for Production on Vercel",
      excerpt: "Best practices for deployment, caching strategies, and monitoring Core Web Vitals.",
      description: "Deploying to Vercel is just the first step. To achieve perfect Lighthouse scores, developers must configure appropriate stale-while-revalidate headers, optimize Next.js Image components, and leverage dynamic ISR (Incremental Static Regeneration). Monitoring user analytics through Vercel Speed Insights ensures performance doesn''t degrade over time.",
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});

  await queryInterface.bulkInsert("Posts", [{
      title: "Optimizing Next.js for Production on Vercel",
      excerpt: "Best practices for deployment, caching strategies, and monitoring Core Web Vitals.",
      description: "Deploying to Vercel is just the first step. To achieve perfect Lighthouse scores, developers must configure appropriate stale-while-revalidate headers, optimize Next.js Image components, and leverage dynamic ISR (Incremental Static Regeneration). Monitoring user analytics through Vercel Speed Insights ensures performance doesn''t degrade over time.",
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete("Posts", null, {});
  }
};
