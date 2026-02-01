import { Check, Circle, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Plans & Pricing - Journli",
  description: "Choose the perfect plan for your travel planning needs. Start free forever or upgrade to Pro for advanced features.",
}

export default async function PlansPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Choose Your Plan</h1>
          <p className="text-md md:text-lg lg:text-xl text-gray-600">Start creating amazing travel itineraries for free. More features coming soon!</p>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-gray-300 transition-all">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Circle className="w-5 h-5 text-black" strokeWidth={1.5} />
                <h2 className="text-2xl font-bold text-gray-900">Free Plan</h2>
              </div>
              <p className="text-gray-600">Perfect for the casual traveler and occasional trip planner</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/forever</span>
              </div>
            </div>

            <Link href="/login">
              <Button className="w-full mb-8 bg-gray-900 hover:bg-gray-800" disabled={user ? true : false}>
                Get Started Free
              </Button>
            </Link>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">20 shareable itineraries</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Access to day-by-day planner</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Share itineraries with anyone</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Save and bookmark favorites</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Follow other travelers</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Profile customization</span>
              </div>
            </div>
          </div>
          
          {/* Standard */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-blue-200 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-cyan-600" />
                <h2 className="text-2xl font-bold text-gray-900">Standard</h2>
              </div>
              <p className="text-gray-600">Ideal for frequent travelers who want more features</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">$6</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <form action="api/checkout-session" method="POST">
              <Button className="w-full mb-8 bg-gray-400" type="submit">
                Upgrade to Standard
              </Button>
            </form>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Everything in Free, plus:</h3>
              
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited itinerary creation</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Added control over content visibility</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Offline access to itineraries</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Collaborative editing</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Custom themes and templates</span>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Monetization capabilities</span>
              </div>
            </div>
          </div>

          {/* Premium - Coming Soon */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-8 border-2 border-purple-200 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
              </div>
              <p className="text-gray-600">Advanced capabilities for creators looking to monetize their content</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">$14</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <Button disabled className="w-full mb-8 bg-gray-400 cursor-not-allowed">
              Coming Soon
            </Button>
            {/* <form action="api/checkout-session" method="POST">
              <input type="hidden" name="lookup_key" value="price_1SvjvgCFWq8paBje5goZvdZk" />
              <Button className="w-full mb-8 bg-gray-400">
                Upgrade to Premium
              </Button>
            </form> */}

            <div className="space-y-4 opacity-75">
              <h3 className="font-semibold text-gray-900 mb-4">Everything in Standard, plus:</h3>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Analytics dashboard</span>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Affiliate program</span>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Explore Page boost</span>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Monetization capabilities</span>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Reduced selling fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison Table */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Compare Plans
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Find the perfect plan for your travel and content creation needs
          </p>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                    <th className="text-center py-4 px-6 font-semibold text-cyan-600">Standard</th>
                    <th className="text-center py-4 px-6 font-semibold text-purple-600">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Pricing */}
                  <tr>
                    <td className="py-4 px-6 font-medium text-gray-900">Monthly Price</td>
                    <td className="py-4 px-6 text-center text-gray-700">$0</td>
                    <td className="py-4 px-6 text-center text-gray-700">$6</td>
                    <td className="py-4 px-6 text-center text-gray-700">$14</td>
                  </tr>

                  {/* Core Features */}
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="py-3 px-6 font-semibold text-sm text-gray-700 uppercase">
                      Core Features
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Public Itineraries</td>
                    <td className="py-4 px-6 text-center text-gray-700">Up to 20</td>
                    <td className="py-4 px-6 text-center text-gray-700">Unlimited</td>
                    <td className="py-4 px-6 text-center text-gray-700">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Itinerary Builder</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Photo Gallery</td>
                    <td className="py-4 px-6 text-center">Limited</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Save Itineraries</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Profile Customization</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Explore Public Itineraries</td>
                    <td className="py-4 px-6 text-center text-sm text-gray-500">Coming Soon</td>
                    <td className="py-4 px-6 text-center text-sm text-gray-500">Coming Soon</td>
                    <td className="py-4 px-6 text-center text-sm text-gray-500">Coming Soon</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Content Visibility Controls</td>
                    <td className="py-4 px-6 text-center text-gray-400">Limited</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Offline Access</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Collaborative Editing</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  {/* <tr>
                    <td className="py-4 px-6 text-gray-700">Insights & Analytics</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr> */}
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Custom Themes & Templates</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>

                  {/* Pro Features */}
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="py-3 px-6 font-semibold text-sm text-gray-700 uppercase">
                      Monetization & Growth
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Analytics Dashboard</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Lock className="w-5 h-5 text-purple-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Affiliate Program</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Lock className="w-5 h-5 text-purple-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Explore Page Boost</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Lock className="w-5 h-5 text-purple-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">Reduced Selling Fee</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center text-gray-400">—</td>
                    <td className="py-4 px-6 text-center"><Lock className="w-5 h-5 text-purple-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Plan Details Section */}
        {/* <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Plan Details
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Free Plan</h3>
              <p className="text-gray-600 mb-4">
                Perfect for casual travelers and those just getting started with digital trip planning.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Create up to 20 itineraries</li>
                <li>• Full access to planning tools</li>
                <li>• Share with anyone via link</li>
                <li>• Connect with other travelers</li>
                <li>• No credit card required</li>
                <li>• Free forever</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-sm border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Standard</h3>
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Ideal for frequent travelers who want unlimited creation and advanced features.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Everything in Free</li>
                <li>• Unlimited itineraries</li>
                <li>• Export to PDF</li>
                <li>• Photo galleries</li>
                <li>• Collaboration tools</li>
                <li>• Premium support</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                For content creators looking to monetize their travel expertise and grow their audience.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Everything in Paid</li>
                <li>• Sell premium itineraries</li>
                <li>• Advanced analytics</li>
                <li>• Affiliate earnings</li>
                <li>• Featured placement</li>
                <li>• Lower platform fees</li>
              </ul>
            </div>
          </div>
        </div> */}

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Is the free plan really free forever?
              </h3>
              <p className="text-gray-600">
                Yes! The free plan includes all core features and will remain free forever. 
                We believe everyone should have access to great travel planning tools.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                When will the other plans be available?
              </h3>
              <p className="text-gray-600">
                We're working hard on bringing the Standard and Premium plans to life! Sign up for our newsletter 
                to be the first to know when they launch.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                Can I upgrade or downgrade my plan later?
              </h3>
              <p className="text-gray-600">
                Once the Standard and Premium plans are available, you'll be able to upgrade at any time. You can also 
                downgrade back to the free plan, and all your itineraries will be preserved.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-2 text-gray-900">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                When Premiums launch, we'll accept all major credit cards, PayPal, and other 
                popular payment methods. Pricing will be transparent with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

