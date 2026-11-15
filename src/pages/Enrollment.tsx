
import { useState, type FormEvent } from "react";
import {
  GraduationCap,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function Enrollment() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Frontend UI demonstration only.
    // Backend API integration will be added later.
    setSubmitted(true);
  };

  const inputStyle =
    "w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-red-100";

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      {/* Page Heading */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#D71920]">
          Join IJSE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#171717]">
          Student Enrollment
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
          Start your journey towards a successful career in software
          engineering. Complete the application form below to express
          your interest in joining IJSE.
        </p>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="flex items-center gap-4 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="rounded-lg bg-red-50 p-3 text-[#D71920]">
            <GraduationCap size={25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#171717]">
              Multiple Courses
            </p>
            <p className="mt-1 text-xs text-[#737373]">
              Choose your preferred program
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="rounded-lg bg-red-50 p-3 text-[#D71920]">
            <BookOpen size={25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#171717]">
              Career Focused
            </p>
            <p className="mt-1 text-xs text-[#737373]">
              Learn practical IT skills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#E5E5E5] bg-white p-5">
          <div className="rounded-lg bg-red-50 p-3 text-[#D71920]">
            <Clock size={25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#171717]">
              Easy Application
            </p>
            <p className="mt-1 text-xs text-[#737373]">
              Submit your details online
            </p>
          </div>
        </div>

      </div>

      {/* Enrollment Form */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm lg:col-span-2 md:p-8">

          <div className="mb-7 border-b border-[#EEEEEE] pb-5">
            <h2 className="text-xl font-bold text-[#171717]">
              Application Form
            </h2>
            <p className="mt-1 text-sm text-[#737373]">
              Please provide your personal and educational details.
            </p>
          </div>

          {submitted && (
            <div className="mb-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <CheckCircle2 className="shrink-0 text-amber-700" size={21} />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Form demonstration completed
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  This is currently a frontend-only form. No application
                  has been sent to the Marketing Department yet.
                  Backend integration is required.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Details */}
            <div>
              <h3 className="mb-4 text-sm font-bold text-[#171717]">
                01. Personal Information
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="07X XXX XXXX"
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className={inputStyle}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your residential address"
                    className={inputStyle}
                  />
                </div>

              </div>
            </div>

            {/* Course Details */}
            <div className="border-t border-[#EEEEEE] pt-6">
              <h3 className="mb-4 text-sm font-bold text-[#171717]">
                02. Course Information
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Select Course *
                  </label>
                  <select className={inputStyle} required defaultValue="">
                    <option value="" disabled>
                      Choose a course
                    </option>
                    <option value="HDSE">Higher Diploma in Software Engineering (HDSE)</option>
                    <option value="CMJD">Comprehensive Master in Java Development (CMJD)</option>
                    <option value="CAME">Certificate in Applied Machine Learning & AI (CAME)</option>
                    <option value="Foundation">Foundation Program</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Preferred Intake *
                  </label>
                  <select className={inputStyle} required defaultValue="">
                    <option value="" disabled>
                      Select an intake
                    </option>
                    <option value="Next Available Intake">
                      Next Available Intake
                    </option>
                    <option value="To Be Announced">
                      To Be Announced
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#404040]">
                    Previous Educational Qualification *
                  </label>
                  <select className={inputStyle} required defaultValue="">
                    <option value="" disabled>
                      Select your qualification
                    </option>
                    <option value="O/L">G.C.E. Ordinary Level</option>
                    <option value="A/L">G.C.E. Advanced Level</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Higher Diploma">Higher Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Additional Details */}
            <div className="border-t border-[#EEEEEE] pt-6">
              <h3 className="mb-4 text-sm font-bold text-[#171717]">
                03. Additional Information
              </h3>

              <label className="mb-2 block text-sm font-medium text-[#404040]">
                Why are you interested in joining IJSE?
              </label>

              <textarea
                rows={4}
                placeholder="Tell us a little about your interests and goals..."
                className={inputStyle + " resize-none"}
              />
            </div>

            {/* Submit */}
            <div className="border-t border-[#EEEEEE] pt-6">
              <label className="mb-5 flex items-start gap-3 text-xs leading-5 text-[#737373]">
                <input
                  type="checkbox"
                  required
                  className="mt-1 accent-[#D71920]"
                />
                <span>
                  I confirm that the information provided is accurate
                  and agree to be contacted regarding my enrollment inquiry.
                </span>
              </label>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D71920] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#B9151B] md:w-auto"
              >
                Submit Application
                <ArrowRight size={18} />
              </button>
            </div>

          </form>
        </div>

        {/* Right Information Panel */}
        <div className="space-y-5">

          <div className="rounded-xl bg-[#171717] p-6 text-white">
            <div className="mb-5 inline-flex rounded-lg bg-[#D71920] p-3">
              <GraduationCap size={28} />
            </div>

            <h2 className="text-xl font-bold">
              Begin Your Journey With IJSE
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-300">
              Develop your technical knowledge, improve your
              problem-solving skills, and prepare for opportunities
              in the IT industry.
            </p>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Our Programs
              </p>

              <ul className="mt-4 space-y-3 text-sm text-gray-200">
                <li>• Higher Diploma in Software Engineering</li>
                <li>• Comprehensive Master in Java Development</li>
                <li>• Applied Machine Learning & AI</li>
                <li>• Foundation Program</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
            <h3 className="font-bold text-[#171717]">
              Enrollment Support
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#737373]">
              Our Marketing Department will handle enrollment inquiries
              after the application system is connected to the backend.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#525252]">
                <Mail size={18} className="text-[#D71920]" />
                <span>Marketing Department</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-[#525252]">
                <Phone size={18} className="text-[#D71920]" />
                <span>Contact details to be added</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-[#525252]">
                <MapPin size={18} className="text-[#D71920]" />
                <span>IJSE, Sri Lanka</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Enrollment;
