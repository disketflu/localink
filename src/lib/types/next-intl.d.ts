import { AbstractIntlMessages } from 'next-intl';

declare module 'next-intl' {
  interface Messages extends AbstractIntlMessages {
    touristDashboard: {
      title: string;
      welcome: string;
      browseTours: string;
      loading: string;
      error: string;
      tabs: {
        bookings: string;
        messages: string;
        reviews: string;
        profile: string;
      };
      tours: {
        noImage: string;
      };
      bookings: {
        guide: string;
        date: string;
        noDate: string;
        status: {
          PENDING: string;
          CONFIRMED: string;
          CANCELLED: string;
          COMPLETED: string;
        };
        cancel: string;
        cancelConfirm: string;
        review: string;
      };
      reviews: {
        noReviews: string;
      };
      profile: {
        title: string;
        subtitle: string;
        profilePicture: string;
        name: string;
        email: string;
        bio: string;
        location: string;
        languages: string;
        notProvided: string;
        notSpecified: string;
        noneSpecified: string;
        editProfile: string;
      };
    };
  }

  interface IntlMessages {
    touristDashboard: {
      title: string;
      welcome: string;
      browseTours: string;
      loading: string;
      error: string;
      tabs: {
        bookings: string;
        messages: string;
        reviews: string;
        profile: string;
      };
      tours: {
        noImage: string;
      };
      bookings: {
        guide: string;
        date: string;
        noDate: string;
        status: {
          PENDING: string;
          CONFIRMED: string;
          CANCELLED: string;
          COMPLETED: string;
        };
        cancel: string;
        cancelConfirm: string;
        review: string;
      };
      reviews: {
        noReviews: string;
      };
      profile: {
        title: string;
        subtitle: string;
        profilePicture: string;
        name: string;
        email: string;
        bio: string;
        location: string;
        languages: string;
        notProvided: string;
        notSpecified: string;
        noneSpecified: string;
        editProfile: string;
      };
    };
  }
} 