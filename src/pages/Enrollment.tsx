
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
  AlertCircle,
} from "lucide-react";
import { submitAdmissionInquiry } from "../services/admission.service";

function Enrollment() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    programInterest: "HDSE",
    intake: "Next Available Intake",
    qualification: "A/L",
    message: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await submitAdmissionInquiry({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        programInterest: formData.programInterest,
        branchPreference: "Panadura",
        message: `${formData.qualification} qualification. Intake: ${formData.intake}. Address: ${formData.address}. Note: ${formData.message}`,
      });
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        programInterest: "HDSE",
        intake: "Next Available Intake",
        qualification: "A/L",
        message: "",
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to submit enrollment application"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-red-100";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Heading */}
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#D71920]">
          Join UniFlow
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[#171717]">
          Student Enrollment
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
          Start your journey towards a successful career in software
          engineering. Complete the application form below to express
          your interest in joining UniFlow.
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
            <div className="mb-6 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="shrink-0 text-emerald-700" size={21} />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Application Submitted Successfully!
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Your enrollment inquiry has been securely sent to the UniFlow Marketing Department.
                  Our admissions counseling team will contact you shortly via email and phone.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="shrink-0 text-[#D71920]" size={21} />
              <div>
                <p className="text-sm font-semibold text-red-900">Submission Error</p>
                <p className="mt-1 text-xs leading-5 text-red-800">{error}</p>
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
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
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
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
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
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
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
                  <select
                    className={inputStyle}
                    required
                    value={formData.programInterest}
                    onChange={(e) =>
                      setFormData({ ...formData, programInterest: e.target.value })
                    }
                  >
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
                  <select
                    className={inputStyle}
                    required
                    value={formData.intake}
                    onChange={(e) =>
                      setFormData({ ...formData, intake: e.target.value })
                    }
                  >
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
                  <select
                    className={inputStyle}
                    required
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                  >
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
                Why are you interested in joining UniFlow?
              </label>

              <textarea
                rows={4}
                placeholder="Tell us a little about your interests and goals..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
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
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D71920] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#B9151B] disabled:opacity-50 md:w-auto"
              >
                {loading ? "Submitting..." : "Submit Application"}
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
              Begin Your Journey With UniFlow
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-300">
              Develop your technical knowledge, improve your
              problem-solving skills, and prepare for high-demand
              careers in software engineering.
            </p>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-xs text-gray-300">
              <p>✔ Comprehensive curriculum</p>
              <p>✔ Industry-experienced lecturers</p>
              <p>✔ Hands-on software development training</p>
              <p>✔ Job-oriented modern skill pathways</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#171717]">
              Need Assistance?
            </h3>

            <p className="mt-2 text-xs leading-5 text-[#737373]">
              Contact our Marketing Department directly for any
              course inquiries or admissions guidance.
            </p>

            <div className="mt-5 space-y-3 text-sm text-[#404040]">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#D71920]" />
                <span>+94 11 2 777 555</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#D71920]" />
                <span>info@ijse.lk</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#D71920]" />
                <span>Pelawatta, Battaramulla</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enrollment;
