import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>tibaba.mu MVP</title>
        <meta name="description" content="tibaba.mu Marketplace in Mauritius" />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-pink via-accent-coral to-primary-mint text-gray-900">
        <div className="container mx-auto px-6 py-20 flex flex-col-reverse md:flex-row items-center justify-between">
          {/* Text Content */}
          <div className="md:w-1/2">
            <h1 className="text-5xl font-header font-extrabold leading-tight mb-6">
              Welcome to tibaba.mu
            </h1>
            <p className="text-lg mb-8">
              Discover, buy, and sell the best baby products with ease and trust.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/products"
                className="px-6 py-3 bg-accent-coral text-gray-900 font-bold rounded-xl shadow hover:bg-accent-deepBlue transition-colors"
              >
                Explore Products
              </Link>
              <Link
                href="/products/add"
                className="px-6 py-3 bg-primary-mint text-gray-800 font-bold rounded-xl shadow hover:bg-accent-coral transition-colors"
              >
                Sell a Product
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="md:w-1/2 flex justify-center">
            <img
              src="/hero-baby-products.png"
              alt="tibaba.mu Hero"
              className="w-full max-w-md md:max-w-lg object-contain h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-header font-bold text-center mb-12 text-primary-pink">
          Why Parents Love Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Feature 1 */}
          <div className="text-center">
            <img
              src="/icons/trusted.svg"
              alt="Trusted Sellers"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-primary-mint mb-2">
              Trusted Sellers
            </h3>
            <p className="text-gray-600">
              Verified and reliable sellers to ensure safe transactions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <img
              src="/icons/variety.svg"
              alt="Wide Variety"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-primary-mint mb-2">
              Wide Variety
            </h3>
            <p className="text-gray-600">
              From essentials to toys, find everything you need for your baby.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <img
              src="/icons/easy-to-use.svg"
              alt="Easy to Use"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-primary-mint mb-2">
              Easy to Use
            </h3>
            <p className="text-gray-600">
              A seamless platform designed for busy parents.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-header font-bold mb-6 text-primary-pink">
            Join the tibaba.mu Marketplace
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Sign up now and become part of the trusted community for parents in Mauritius.
          </p>
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-primary-pink text-gray-800 font-bold rounded-xl shadow hover:bg-accent-coral transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
