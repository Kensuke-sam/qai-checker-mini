export const SignOutButton = () => (
  <form action="/api/auth/signout" method="post">
    <button
      type="submit"
      className="rounded-full border border-line px-5 py-3 font-semibold transition hover:border-accent/40 hover:text-accent-strong"
    >
      ログアウト
    </button>
  </form>
);
