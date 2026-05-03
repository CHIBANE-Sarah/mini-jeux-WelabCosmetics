<?php

namespace App\DataFixtures;

use App\Entity\Game;
use App\Entity\Session;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class SessionFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        /** @var User $admin */
        $admin = $this->getReference('user_admin', User::class);

        // Session 1 - Mots Croisés uniquement
        $session1 = new Session();
        $session1->setTitreSession('Mots Croisés Cosmétiques');
        $session1->setCodeSession('SESS01');
        $session1->setDuree(900); // 15 minutes en secondes
        $session1->setCreateur($admin);

        $game1 = new Game();
        $game1->setType(Game::TYPE_CROSSWORD);
        $game1->setSession($session1);
        $session1->addGame($game1);

        $manager->persist($session1);
        $manager->persist($game1);
        $this->addReference('session_1', $session1);

        // Session 2 - Association uniquement

        // Session 3 - Formulation uniquement
        $session3 = new Session();
        $session3->setTitreSession('Formulation de Produits');
        $session3->setCodeSession('SESS03');
        $session3->setDuree(1200); // 20 minutes en secondes
        $session3->setCreateur($admin);

        $game3 = new Game();
        $game3->setType(Game::TYPE_FORMULATION);
        $game3->setSession($session3);
        $session3->addGame($game3);

        $manager->persist($session3);
        $manager->persist($game3);
        $this->addReference('session_3', $session3);

        // Session 4 - Les 3 jeux (session complète pour tester le parcours joueur)

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [UserFixtures::class];
    }
}