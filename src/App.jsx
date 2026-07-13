import ContactForm from "./componentes/dashboard/ContactForm";
import Exclusivity from "./componentes/dashboard/Exclusivity";
import FeaturedProperties from "./componentes/dashboard/FeaturedProperties";
import Hero from "./componentes/dashboard/Hero";
import Navbar from "./componentes/dashboard/Navbar";
import Footer from "./componentes/dashboard/Footer";
import Divider from "./componentes/dashboard/utils/Divider";
import ScrollReveal from "./componentes/dashboard/utils/ScrollReveal";

function App() {
  return (
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
  );
}

export default App;
