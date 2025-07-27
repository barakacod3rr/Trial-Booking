import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: CalendarIcon,
      title: 'Easy Booking',
      description: 'Book your golf bay in just a few clicks with our intuitive booking system.'
    },
    {
      icon: ClockIcon,
      title: '10 AM - 10 PM',
      description: 'Extended hours to fit your schedule with 30-minute time slots available.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Competitive Rates',
      description: 'Bay Only: 2000 KES/hour | Coaching + Bay: 3000 KES/hour'
    },
    {
      icon: UserGroupIcon,
      title: 'Group Friendly',
      description: 'Accommodate up to 8 players per bay for group events and practice sessions.'
    }
  ];

  const bayTypes = [
    {
      title: 'Bay Only',
      price: '2000 KES/hour',
      bays: 'Bays 1-10',
      features: [
        'Practice driving range',
        'Ball dispensing system',
        'Distance markers',
        'Comfortable seating area',
        'Up to 8 players'
      ],
      color: 'bg-blue-500'
    },
    {
      title: 'Coaching + Bay',
      price: '3000 KES/hour',
      bays: 'Bays 11-12',
      features: [
        'Professional golf instructor',
        'Personalized coaching session',
        'Swing analysis',
        'Practice driving range',
        'Equipment provided',
        'Up to 8 players'
      ],
      color: 'bg-golf-500'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-b from-golf-50 to-white rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Premium Golf Bay Experience
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Book your perfect golf practice session with state-of-the-art facilities,
            professional coaching options, and flexible time slots to fit your schedule.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center space-x-2 bg-golf-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-golf-600 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <CalendarIcon className="w-6 h-6" />
            <span>Book Your Bay Now</span>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          <p className="text-lg text-gray-600">Everything you need for the perfect golf experience</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-4">
                <feature.icon className="w-12 h-12 text-golf-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bay Types */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Experience</h2>
          <p className="text-lg text-gray-600">Select the perfect bay type for your needs</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {bayTypes.map((bayType, index) => (
            <div key={index} className="card relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-2 ${bayType.color}`}></div>
              
              <div className="pt-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{bayType.title}</h3>
                    <p className="text-gray-600">{bayType.bays}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-golf-500">{bayType.price}</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {bayType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-golf-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Process */}
      <section className="bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple Booking Process</h2>
          <p className="text-lg text-gray-600">Get your bay reserved in 4 easy steps</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Choose Bay', desc: 'Select bay type and number of players' },
              { step: '2', title: 'Pick Time', desc: 'Choose date and consecutive time slots' },
              { step: '3', title: 'Your Details', desc: 'Enter contact information' },
              { step: '4', title: 'Pay & Confirm', desc: 'Secure payment via PesaPal' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-golf-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="card bg-golf-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-lg text-gray-600">Have questions? We're here to help!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <PhoneIcon className="w-8 h-8 text-golf-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Phone</h3>
            <p className="text-gray-600">+254 123 456 789</p>
          </div>
          <div>
            <MapPinIcon className="w-8 h-8 text-golf-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Location</h3>
            <p className="text-gray-600">Premium Golf Center, Nairobi</p>
          </div>
          <div>
            <ClockIcon className="w-8 h-8 text-golf-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Hours</h3>
            <p className="text-gray-600">10:00 AM - 10:00 PM Daily</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;