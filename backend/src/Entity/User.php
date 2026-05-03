<?php

// Namespace : emplacement logique de la classe dans le projet Symfony.
namespace App\Entity;

// Repository associé à l'entité User.
use App\Repository\UserRepository;

// Collections Doctrine utilisées pour gérer les relations OneToMany.
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

// ORM permet d'utiliser les attributs Doctrine pour mapper la classe en table SQL.
use Doctrine\ORM\Mapping as ORM;

// Interfaces Symfony nécessaires pour l'authentification.
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

// Indique que cette classe est une entité Doctrine liée au UserRepository.
#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    // Identifiant unique de l'utilisateur en base de données.
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // Login unique utilisé pour se connecter.
    #[ORM\Column(length: 180, unique: true)]
    private ?string $login = null;

    /**
     * Liste des rôles de l'utilisateur, par exemple ROLE_ADMIN.
     *
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * Mot de passe haché, jamais stocké en clair.
     *
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    // Nom de l'utilisateur.
    #[ORM\Column(length: 50)]
    private ?string $nom = null;

    // Prénom de l'utilisateur.
    #[ORM\Column(length: 50)]
    private ?string $prenom = null;

    /**
     * Relation OneToMany :
     * un utilisateur peut créer plusieurs sessions.
     *
     * @var Collection<int, Session>
     */
    #[ORM\OneToMany(targetEntity: Session::class, mappedBy: 'createur')]
    private Collection $sessionsCrees;

    // Niveau d'étude optionnel.
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $niveauEtude = null;

    // Établissement optionnel.
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $etablissement = null;

    // Constructeur appelé à la création d’un objet User.
    public function __construct()
    {
        // Initialise la collection de sessions créées.
        $this->sessionsCrees = new ArrayCollection();
    }

    // Retourne l'identifiant technique de l'utilisateur.
    public function getId(): ?int
    {
        return $this->id;
    }

    // Retourne le login de l'utilisateur.
    public function getLogin(): ?string
    {
        return $this->login;
    }

    // Modifie le login et retourne l'objet courant.
    public function setLogin(string $login): static
    {
        $this->login = $login;

        return $this;
    }

    /**
     * Identifiant utilisé par Symfony Security.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->login;
    }

    /**
     * Retourne les rôles de l'utilisateur.
     *
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;

        // Garantit que chaque utilisateur possède au minimum ROLE_USER.
        $roles[] = 'ROLE_USER';

        // Supprime les doublons éventuels.
        return array_unique($roles);
    }

    /**
     * Définit les rôles de l'utilisateur.
     *
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * Retourne le mot de passe haché.
     *
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    // Définit le mot de passe haché.
    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * Évite de sérialiser le mot de passe réel dans une session.
     * Ici, Symfony remplace le mot de passe par une empreinte hashée.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0".self::class."\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    // Ancienne méthode Symfony, conservée pour compatibilité.
    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // À supprimer lors du passage à Symfony 8.
    }

    // Retourne le nom.
    public function getNom(): ?string
    {
        return $this->nom;
    }

    // Définit le nom.
    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    // Retourne le prénom.
    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    // Définit le prénom.
    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    /**
     * Retourne toutes les sessions créées par cet utilisateur.
     *
     * @return Collection<int, Session>
     */
    public function getSessionsCrees(): Collection
    {
        return $this->sessionsCrees;
    }

    // Ajoute une session créée à l'utilisateur.
    public function addSessionsCree(Session $sessionsCree): static
    {
        // Évite d’ajouter deux fois la même session.
        if (!$this->sessionsCrees->contains($sessionsCree)) {
            $this->sessionsCrees->add($sessionsCree);

            // Met aussi à jour le côté propriétaire de la relation.
            $sessionsCree->setCreateur($this);
        }

        return $this;
    }

    // Retire une session de la liste des sessions créées.
    public function removeSessionsCree(Session $sessionsCree): static
    {
        if ($this->sessionsCrees->removeElement($sessionsCree)) {
            // Si cette session avait cet utilisateur comme créateur, on retire le lien.
            if ($sessionsCree->getCreateur() === $this) {
                $sessionsCree->setCreateur(null);
            }
        }

        return $this;
    }

    // Retourne le niveau d'étude.
    public function getNiveauEtude(): ?string
    {
        return $this->niveauEtude;
    }

    // Définit le niveau d'étude.
    public function setNiveauEtude(?string $niveauEtude): static
    {
        $this->niveauEtude = $niveauEtude;

        return $this;
    }

    // Retourne l'établissement.
    public function getEtablissement(): ?string
    {
        return $this->etablissement;
    }

    // Définit l'établissement.
    public function setEtablissement(?string $etablissement): static
    {
        $this->etablissement = $etablissement;

        return $this;
    }
}