import ContactForm from "./dashboard/ContactForm";
import Exclusivity from "./dashboard/Exclusivity";
import FeaturedProperties from "./dashboard/FeaturedProperties";
import Hero from "./dashboard/Hero";
import Navbar from "./dashboard/Navbar";
import Footer from "./dashboard/Footer";
import Divider from "./dashboard/utils/Divider";
import ScrollReveal from "./dashboard/utils/ScrollReveal";

function Dashboard(){
return(
  <div className="min-h-screen bg-brand-bg text-brand-text">
      <Navbar />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <ScrollReveal>
        <FeaturedProperties />
        </ScrollReveal>
        <Divider />
        <ScrollReveal>
          <Exclusivity />
        </ScrollReveal>
        <Divider />
        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
)
}

export default Dashboard;