import React from "react";
import Hero from "../../components/website/hero/Hero";
import image from "../../assets/hero.jpg";

const AboutUs = () => {
  return (
    <div className="bg text__color">
      <Hero
        title="Introduction"
        text={
          "The Libraries are wonderful gathering places to study, to write and to pursue scholarly research, to learn and use information technology, and draw on collections of printed and electronic resources. The College Library acts as a gateway to information and knowledge. Government Graduate College Jhelum  has a rich Library system "
        }
        image={image}
        reverse={true}
      />

      <Hero
        title="Mission"
        text={
          "The mission of the GGC Library is to achieve excellence in the provision and promotion of information services to meet the research, teaching and learning needs of the College. We are committed to help the students and the faculty to take advantage of these resources. An effective use of information resources is a necessary precondition to an academic success and even throughout life. It is our goal at the libraries to provide excellent service to students and faculty that will advance each user’s learning, teaching, and research experience at the Government Graduate College ,Jhelum."
        }
        image={image}
      />

      <Hero
        title="Collection"
        text={
          "The GGC Library collection of scholarly materials catering to the needs of the College Community, comprising students to staff members, teachers/scholars, and visiting researchers. Total Collection of all the libraries are about 25000/ volumes. The Libraries vary widely in size and quantity of their stock but include well organized collections of considerable value. Our book collection contains rare editions, reference volumes, critical guides and latest releases. We have a large collection of research journals/periodicals including magazines."
        }
        image={image}
        reverse={true}
      />

      <Hero
        title="Access / Facilities"
        text={
          "Most of the Libraries have open shelf systems and users can get free access to the library materials. Computers with access to library resources and the Internet are available in Libraries mostly. Research access is available to all College Community in the form of catalogs, licensed library resources and websites. Priority for use is given to students, faculty, and staff pursuing research. The concerned library staff is available to advise and guide the users. Information about the library use policy is available at the Library Circulation Desks."
        }
        image={image}
      />
    </div>
  );
};

export default AboutUs;
